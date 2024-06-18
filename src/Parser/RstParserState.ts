import { Token } from '@/Lexer/Token.js'
import { RstNode, RstNodeSource } from '@/RstNode/RstNode.js'
import { ContinuousText, RstText } from '@/RstNode/Inline/Text.js'
import { RstCitationRef } from '@/RstNode/Inline/CitationRef.js'
import { RstEmphasis } from '@/RstNode/Inline/Emphasis.js'
import { RstFootnoteRef } from '@/RstNode/Inline/FootnoteRef.js'
import { RstHyperlinkRef } from '@/RstNode/Inline/HyperlinkRef.js'
import { RstInlineInternalTarget } from '@/RstNode/Inline/InlineInternalTarget.js'
import { RstInlineLiteral } from '@/RstNode/Inline/InlineLiteral.js'
import { RstInterpretedText, interpretedTextRoleRe } from '@/RstNode/Inline/InterpretedText.js'
import { RstStrongEmphasis } from '@/RstNode/Inline/StrongEmphasis.js'
import { RstSubstitutionRef } from '@/RstNode/Inline/SubstitutionRef.js'
import { isMatchingQuotationMarks } from '@/utils/isMatchingQuotationMarks.js'
import { mergeSequentialTextNodes } from '@/utils/mergeSequentialTextNodes.js'
import { RstParserOptions } from './RstParserOptions.js'
import { RstCompiler } from '@/RstCompiler.js'
import { RstDocument } from '@/RstNode/Block/Document.js'
import { RstFieldList, fieldListItemRe } from '@/RstNode/List/FieldList.js'
import { tokenizeInput } from '@/Lexer/tokenizeInput.js'
import { RstNodeRegistrar } from './RstNodeRegistrar.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { RstParserError } from './RstParserError.js'
import { standaloneHyperlinkRefReStr } from '@/utils/parseEmbededRef.js'
import { mergeSequentialLists } from '@/utils/mergeSequentialLists.js'
import { HtmlAttrResolver } from './Resolver/HtmlAttrResolver.js'
import { SimpleNameResolver } from './Resolver/SimpleNameResolver.js'
import { SubstitutionResolver } from './Resolver/SubstitutionResolver.js'
import { trimCommonIndent } from '@/utils/trimCommonIndent.js'

export type RstParserOutput = {
    root: RstDocument
    htmlAttrResolver: HtmlAttrResolver
    substitutionResolver: SubstitutionResolver
    simpleNameResolver: SimpleNameResolver
}

export class RstParserState {
    private _tokenIdx: number
    private readonly _tokens: ReadonlyArray<Token>
    private readonly _compiler: RstCompiler
    private readonly _registrar: RstNodeRegistrar
    private readonly _sectionMarkers: Array<string>
    private readonly _lineOffset: number

    readonly rootBodyNodes: ReadonlyArray<RstNode>
    readonly rootSource: RstNodeSource

    constructor(
        readonly opts: Readonly<RstParserOptions>,
        tokens: ReadonlyArray<Token>,
        compiler: RstCompiler,
        registrar = new RstNodeRegistrar(),
        lineOffset = 0,
    ) {
        this._tokenIdx = 0
        this._tokens = tokens
        this._compiler = compiler
        this._registrar = registrar
        this._sectionMarkers = []
        this._lineOffset = lineOffset

        const startLineIdx = this.lineIdx
        this.rootBodyNodes = this.parseBodyNodes(0, RstNodeType.Document)
        const endLineIdx = this.lineIdx
        this.rootSource = { startLineIdx, endLineIdx }
    }

    get parserOutput(): RstParserOutput {
        const root = this.opts.parseFirstFieldListAsDocumentMeta && this.rootBodyNodes.length >= 1 && this.rootBodyNodes[0] instanceof RstFieldList
            ? new RstDocument(this._registrar, this.rootSource, this.rootBodyNodes.slice(1), this.rootBodyNodes[0])
            : new RstDocument(this._registrar, this.rootSource, this.rootBodyNodes, null)

        return this._compiler.createParserOutput(root)
    }

    // ------------------------------------------------------------------------
    // MARK: Document State
    // ------------------------------------------------------------------------

    get registrar(): RstNodeRegistrar {
        return this._registrar
    }

    registerSectionMarker(marker: string): number {
        if (!this._sectionMarkers.includes(marker)) {
            this._sectionMarkers.push(marker)
        }

        // Get 1-based index of the marker
        return this._sectionMarkers.indexOf(marker) + 1
    }

    // ------------------------------------------------------------------------
    // MARK: Consume/Peek
    // Helpers for parsing
    // ------------------------------------------------------------------------

    get lineIdx(): number {
        return this._tokenIdx + this._lineOffset
    }

    getTokens(startIdx: number, endIdx: number): Array<Token> {
        return this._tokens.slice(startIdx, endIdx)
    }

    advance(n: number): void {
        if (n < 1) {
            throw new RstParserError(this, `Invalid n:${n}`)
        }

        const newIdx = this._tokenIdx + n
        if (newIdx > this._tokens.length) {
            throw new RstParserError(this, `Out of bounds n:${n} newIdx:${newIdx}`)
        }

        this._tokenIdx = newIdx
    }

    consume(): Token {
        if (!this.canConsume()) {
            throw new RstParserError(this, `Invalid tokenIdx:${this._tokenIdx}`)
        }

        return this._tokens[this._tokenIdx++]
    }

    consumeAllNewLines(): void {
        while (this.peekIsNewLine()) {
            this.consume()
        }
    }

    canConsume(offset = 0): boolean {
        const idx = this._tokenIdx + offset
        return idx >= 0 && idx < this._tokens.length
    }

    peek(offset = 0): Token | null {
        const idx = this._tokenIdx + offset
        if (idx < 0 || idx >= this._tokens.length) {
            return null
        }

        return this._tokens[idx]
    }

    peekIsNewLine(offset = 0): boolean {
        const nextToken = this.peek(offset)
        if (!nextToken) {
            return false
        }

        return nextToken.str.length === 0
    }

    peekIsContent(offset = 0): boolean {
        const nextToken = this.peek(offset)
        if (!nextToken) {
            return false
        }

        return nextToken.str.length > 0
    }

    peekTest(re: RegExp, offset = 0): RegExpExecArray | null {
        const nextToken = this.peek(offset)
        if (!nextToken) {
            return null
        }

        return re.exec(nextToken.str)
    }

    peekIndentSize(offset = 0): number {
        return this.peek(offset)?.str.search(/\S|$/) ?? 0
    }

    peekIsIndented(expectedIndentSize: number, offset = 0): boolean {
        return this.peekIndentSize(offset) === expectedIndentSize
    }

    peekIsAtleastIndented(expectedIndentSize: number, offset = 0): boolean {
        return this.peekIndentSize(offset) >= expectedIndentSize
    }

    /**
     * Returns the smallest nested indent size (guaranteed to be greater than currentIndentSize)
     *
     * Otherwise this returns default of `currentIndentSize + 1`
     *
     * **NOTE:** This does not imply the existence of nested blocks, just the indentation of what they should be at if they exists
     */
    peekNestedIndentSize(currentIndentSize: number, nextIndentSize = 1): number {
        const defaultNestedIndentSize = currentIndentSize + nextIndentSize

        let offset = 0
        let bodyIndentSize = Number.MAX_SAFE_INTEGER
        let foundNestedContent = false

        while (true) {
            if (!this.canConsume(offset)) {
                break
            }

            const lineIndentSize = this.peekIndentSize(offset)
            if (this.peekIsContent(offset) && lineIndentSize <= currentIndentSize) {
                break
            }

            if (this.peekIsContent(offset)) {
                bodyIndentSize = Math.min(bodyIndentSize, lineIndentSize)
                foundNestedContent = true
            }

            offset += 1
        }

        if (foundNestedContent) {
            return Math.max(bodyIndentSize, defaultNestedIndentSize)
        } else {
            return defaultNestedIndentSize
        }
    }

    // ------------------------------------------------------------------------
    // MARK: Parser
    // ------------------------------------------------------------------------

    parseRstToAst(input: string, startingLineIdx: number): ReadonlyArray<RstNode> {
        // Simulate lines above where this mini-Document is being parsed from
        // so that the returned nodes' line numbers are correct
        const trimmedInput = trimCommonIndent(input)
        const tokens = tokenizeInput(trimmedInput)
        const subParserState = new RstParserState(this.opts, tokens, this._compiler, this.registrar, startingLineIdx)
        return subParserState.rootBodyNodes
    }

    parseBodyNodes(indentSize: number, parentType: RstNodeType, initNodes: ReadonlyArray<RstNode> = []): ReadonlyArray<RstNode> {
        const nodes = [...initNodes]

        while (true) {
            const prevNode = nodes.at(-1)

            // Consume all blank lines before parsing next block
            this.consumeAllNewLines()

            // Exit when we're out of lines to consume
            if (!this.canConsume()) {
                break
            }

            // Exit if we are inside a node and encounted an empty comment
            if (parentType !== RstNodeType.Document && this.peekTest(/^\.\.$/) && this.peekIsNewLine(1)) {
                this.consume() // Consume the empty comment
                break
            }

            // Exit if we are inside a node but encounter a new block without the same indentation
            if (parentType !== RstNodeType.Document && this.peekIndentSize() < indentSize) {
                break
            }

            const { node, shouldExitBody } = (() => {
                for (const parser of this._compiler.nodeParsers) {
                    const node = parser.parse(this, indentSize, parentType, prevNode)
                    if (node === null) {
                        continue
                    }

                    return {
                        node,
                        shouldExitBody: parser.onParseShouldExitBody,
                    }
                }

                throw new RstParserError(this, `Failed to find parser to parse token: "${this.peek()?.str ?? ''}"`)
            })()

            nodes.push(node)

            if (shouldExitBody) {
                break
            }
        }

        return mergeSequentialLists(this._registrar, nodes)
    }

    parseBodyText(indentSize: number, parentType: RstNodeType, lineRegex?: RegExp): string {
        let bodyText = ''

        while (true) {
            // Exit if line does not match optional regex
            if (lineRegex && !this.peekTest(lineRegex)) {
                break
            }

            // Consume all blank lines before parsing next block
            while (this.peekIsNewLine()) {
                bodyText += '\n'
                this.consume()
            }

            // Exit when we're out of lines to consume
            if (!this.canConsume()) {
                break
            }

            // Exit if we are inside a node and encounted an empty comment
            if (parentType !== RstNodeType.Document && this.peekTest(/^\.\.$/) && this.peekIsNewLine(1)) {
                this.consume() // Consume the empty comment
                break
            }

            // Exit if we are inside a node but encounter a new block without the same indentation
            if (parentType !== RstNodeType.Document && this.peekIndentSize() < indentSize) {
                break
            }

            const line = this.consume()
            const lineText = line.str.substring(indentSize)
            bodyText += '\n' + lineText
        }

        bodyText = bodyText.replace(/^\n+/, '') // Remove all newlines at start
        bodyText = bodyText.replace(/\n+$/, '') // Remove all newlines at end

        return bodyText
    }

    /**
     * After consuming first line of any ExplicitMarkup, this returns a Paragraph containing
     * the first line and any subsequent continuous lines
     */
    parseInitContentText(nestedBodyIndentSize: number, firstLineText: string, preserveLineBreaks = true): string {
        const isSecondLineContinuingFirstLine = (() => {
            // FieldListItem cannot be included
            if (this.peekTest(fieldListItemRe)) {
                return false
            }

            // Other nested ExplicitMarkup (e.g. Comment) cannot be included
            if (this.peekTest(/^ *\.\. +/)) {
                return false
            }

            // Any non-empty line continues first line
            return this.peekIsContent()
        })()

        let bodyText = firstLineText
        if (isSecondLineContinuingFirstLine) {
            while (this.peekIsContent() && this.peekIsAtleastIndented(nestedBodyIndentSize)) {
                const line = this.consume()
                const lineText = line.str.substring(nestedBodyIndentSize)

                if (preserveLineBreaks) {
                    bodyText += '\n' + lineText
                } else {
                    bodyText += lineText
                }
            }
        }

        bodyText = bodyText.replace(/^\n+/, '') // Remove all newlines at start
        bodyText = bodyText.replace(/\n+$/, '') // Remove all newlines at end

        return bodyText
    }

    parseInitContent(nestedBodyIndentSize: number, firstLineText: string, startLineIdx: number, preserveLineBreaks = true): ReadonlyArray<RstNode> {
        const bodyText = this.parseInitContentText(nestedBodyIndentSize, firstLineText, preserveLineBreaks)
        this.consumeAllNewLines()
        return this.parseRstToAst(bodyText, startLineIdx)
    }

    // ------------------------------------------------------------------------
    // MARK: InlineParser
    // ------------------------------------------------------------------------

    parseInlineNodes(input: string, source: RstNodeSource): ContinuousText {
        const parsedGroups = this.parseInlineNodesWithDelimiter(input, source)
        if (parsedGroups.length !== 1) {
            throw new RstParserError(this, 'Failed to parse without delimiter')
        }

        return parsedGroups[0]
    }

    parseInlineNodesWithDelimiter(input: string, source: RstNodeSource, delimiter?: string): Array<ContinuousText> {
        const parsedGroups = new Array<ContinuousText>()
        parsedGroups.push([])

        const startRe = delimiter && delimiter.length > 1
            ? new RegExp(`${this.getStartStringRe().source}|(?<delimiter>${delimiter})`, 'g')
            : this.getStartStringRe()

        let consumedIdx = 0
        while (consumedIdx < input.length) {
            // Start search after already consumed characters
            startRe.lastIndex = consumedIdx

            // Find next inline markup or delimiter in the input
            // Otherwise break out of this search loop
            const startMatch = startRe.exec(input)
            if (!startMatch) {
                break
            }

            // inlineTextIdx points to start of inline text (excluding start string)
            //
            //      startMatch.index
            //      |
            //      |       inlineTextIdx
            //      |       |
            //      :role:**test**:role:
            //              |   |
            //              |   endMatch.index
            //              |
            //              endMatch.index origin
            //
            const inlineTextIdx = startMatch.index + startMatch[0].length
            const endStringSearchSpace = input.substring(inlineTextIdx)

            // Everything between (old) idx and inlineTextIdx is treated as plaintext
            const precedingTextLen = startMatch.index - consumedIdx
            if (precedingTextLen > 0) {
                const precedingTextRaw = input.substring(consumedIdx, startMatch.index)
                const precedingTextTokens = this.parsePlaintextForUrls(precedingTextRaw, source)
                parsedGroups.at(-1)?.push(...precedingTextTokens)
                consumedIdx += precedingTextRaw.length
            }

            // Rule 5:
            // If start string is preceded by quotation ' " < ( [ {
            // then it must NOT be followed by the closing quotation ' " > ) ] }
            const charBeforeStart = input[startMatch.index - 1]
            const charAfterStart = input[startMatch.index + startMatch[0].length]
            if (isMatchingQuotationMarks(charBeforeStart, charAfterStart)) {
                // Do not parse as inline markup if startString is wrapped in quotation characters
                parsedGroups.at(-1)?.push(new RstText(this.registrar, source, startMatch[0]))
                consumedIdx += startMatch[0].length
                continue
            }

            // If we find the delimiter, then register new group and keep parsing
            if (startMatch.groups?.delimiter) {
                parsedGroups.push([])
                consumedIdx += startMatch[0].length
                continue
            }

            const startString = startMatch?.groups?.startString
            const rolePrefix = startMatch?.groups?.rolePrefix

            const endRe = this.getEndStringRe(startString)
            const endMatch = endRe.exec(endStringSearchSpace)
            if (!endMatch) {
                // Cannot find matching endString in the input so we skip the startString and treat it as plaintext
                parsedGroups.at(-1)?.push(new RstText(this.registrar, source, startMatch[0]))
                consumedIdx += startMatch[0].length
                continue
            }

            const endString = endMatch?.groups?.endString
            const roleSuffix = endMatch?.groups?.roleSuffix
            const inlineTextRaw = endStringSearchSpace.substring(0, endMatch.index)

            switch (true) {
                case (startString === '**' && endString === '**'): {
                    parsedGroups.at(-1)?.push(new RstStrongEmphasis(this.registrar, source, inlineTextRaw))
                    break
                }

                case (startString === '*' && endString === '*'): {
                    parsedGroups.at(-1)?.push(new RstEmphasis(this.registrar, source, inlineTextRaw))
                    break
                }

                case (startString === '``' && endString === '``'): {
                    parsedGroups.at(-1)?.push(new RstInlineLiteral(this.registrar, source, inlineTextRaw))
                    break
                }

                case (startString === '`' && endString === '`' && this.isValidInterpretedText(inlineTextRaw, rolePrefix ?? roleSuffix)): {
                    const role = rolePrefix ?? roleSuffix ?? this.opts.defaultInterpretedTextRole
                    parsedGroups.at(-1)?.push(new RstInterpretedText(this.registrar, source, inlineTextRaw, role))
                    break
                }

                case (startString === '|' && endString === '|'): {
                    parsedGroups.at(-1)?.push(new RstSubstitutionRef(this.registrar, source, inlineTextRaw))
                    break
                }

                case (startString === '_`' && endString === '`'): {
                    parsedGroups.at(-1)?.push(new RstInlineInternalTarget(this.registrar, source, inlineTextRaw))
                    break
                }

                case (startString === '[' && endString === ']_' && RstFootnoteRef.isValidText(inlineTextRaw)): {
                    parsedGroups.at(-1)?.push(new RstFootnoteRef(this.registrar, source, inlineTextRaw))
                    break
                }

                case (startString === '[' && endString === ']_' && RstCitationRef.isValidText(inlineTextRaw)): {
                    parsedGroups.at(-1)?.push(new RstCitationRef(this.registrar, source, inlineTextRaw))
                    break
                }

                // HyperlinkRef needs unescaped text since it needs to further parse the text for embeded links (if any)
                // Example: `abc <123>`_ parses with label "abc"
                // However, `abc \<123>`_ parses with label "abc <123>"
                case (startString === '`' && endString === '`_'): {
                    const isAnonymous = false
                    parsedGroups.at(-1)?.push(new RstHyperlinkRef(this.registrar, source, inlineTextRaw, isAnonymous))
                    break
                }

                case (startString === '`' && endString === '`__'):{
                    const isAnonymous = true
                    parsedGroups.at(-1)?.push(new RstHyperlinkRef(this.registrar, source, inlineTextRaw, isAnonymous))
                    break
                }

                default: {
                    // Cannot find a matching inline markup (e.g. invalid inlineTextRaw) so we skip the startString and treat it as plaintext
                    parsedGroups.at(-1)?.push(new RstText(this.registrar, source, startMatch[0]))
                    consumedIdx += startMatch[0].length
                    continue
                }
            }

            consumedIdx = inlineTextIdx + endMatch.index + endMatch[0].length
        }

        // Finally add any leftover unmatched text
        if (consumedIdx < input.length) {
            const followingTextRaw = input.substring(consumedIdx)
            const followingTextTokens = this.parsePlaintextForUrls(followingTextRaw, source)
            parsedGroups.at(-1)?.push(...followingTextTokens)
        }

        return parsedGroups.map((group) => mergeSequentialTextNodes(this.registrar, group))
    }

    // ------------------------------------------------------------------------
    // MARK: InlineParser Helpers
    // ------------------------------------------------------------------------

    private parsePlaintextForUrls(plaintext: string, source: RstNodeSource): ContinuousText {
        const outputTokens = new Array<RstText>()
        const escapedText = (plaintext) // Need to first escape text before parsing for standalone urls

        let consumedIdx = 0
        const hyperlinkRe = new RegExp(
            this._inlineMarkupStartLookbehindReStr +
            `(?:${standaloneHyperlinkRefReStr})` +
            this._inlineMarkupEndLookaheadReStr
            ,
            'g', // Global flag so we can iterate over all matches
        )

        while (consumedIdx < escapedText.length) {
            const urlMatch = hyperlinkRe.exec(escapedText)
            if (!urlMatch) {
                break
            }

            const precedingTextLen = urlMatch.index - consumedIdx
            if (precedingTextLen > 0) {
                const precedingText = escapedText.substring(consumedIdx, consumedIdx + precedingTextLen)
                outputTokens.push(new RstText(this.registrar, source, precedingText))
                consumedIdx += precedingText.length
            }

            const isAnonymous = urlMatch.groups?.simpleNameTail === '__'
            const rawSimpleName = urlMatch.groups?.simpleName
            const rawUrl = urlMatch.groups?.embedUrl ?? urlMatch.groups?.url
            const rawEmail = urlMatch.groups?.embedEmail ?? urlMatch.groups?.email

            const refTarget = rawSimpleName ?? rawUrl ?? rawEmail
            if (!refTarget) {
                throw new RstParserError(this, `Failed to parse url:${urlMatch[0]}`)
            }

            outputTokens.push(new RstHyperlinkRef(this.registrar, source, refTarget, isAnonymous))
            consumedIdx += urlMatch[0].length
        }

        // Finally add any leftover unmatched text
        if (consumedIdx < escapedText.length) {
            const followingText = escapedText.substring(consumedIdx)
            outputTokens.push(new RstText(this.registrar, source, followingText))
        }

        return outputTokens
    }

    private get _inlineMarkupStartLookbehindReStr(): string {
        // If enabled, then we do not check the character before inline markup's startString
        if (this.opts.enableCharacterLevelInlineMarkup) {
            return ''
        }

        return '(?<=' +     // Positive lookbehind
            '^' + '|' +     // Start of text
            '\\s' + '|' +   // Whitespace
            [
                '-',
                ':',
                '/',
                '\'',
                '"',
                '<',
                '\\(',
                '\\[',
                '\\{',
            ].join('|') + // Special punctuations
        ')'
    }

    private get _inlineMarkupEndLookaheadReStr(): string {
        // If enabled, then we do not check the character after inline markup's endString
        if (this.opts.enableCharacterLevelInlineMarkup) {
            return ''
        }

        return '(?=' +      // Positive lookahead
            '$' + '|' +     // End of text
            '\\s' + '|' +   // Whitespace
            [               // Special punctuations
                '-',
                '\\.',
                ',',
                ':',
                ';',
                '!',
                '\\?',
                '\\/',
                '\\\\',
                "'",
                '"',
                '>',
                '\\)',
                '\\]',
                '\\}',
            ].join('|') +
        ')'
    }

    private getStartStringRe(): RegExp {
        return new RegExp(
            // Not preceded by single escape slash
            '(?<!(?<!\\\\)\\\\)' +

            // Assert lookbehind char
            this._inlineMarkupStartLookbehindReStr +

            // Role for InterpretedText
            `(?::(?<rolePrefix>${interpretedTextRoleRe.source}):)?` +

            // Match inline markup start string
            '(?<startString>' +
                '\\*\\*' + '|' +    // Strong emphasis
                '\\*' + '|' +       // Emphasis
                '``' + '|' +        // Inline literal
                '`' + '|' +         // Interpreted text
                '\\|' + '|' +       // Substitution ref

                '_`' + '|' +        // Inline internal target
                '\\[' + '|' +       // Footnote ref
                '`' +               // Hyperlink ref
            ')' +

            // Followed by non-whitespace or escaped whitespace
            '(?=\\S|\\\\\\s)',

            // Global flag
            'g',
        )
    }

    private getEndStringRe(startString?: string): RegExp {
        let endStringReString: string
        let isInlineLiteral = false
        switch (startString) {
            // Emphasis
            case '*':
                endStringReString = '\\*'
                break

            // StrongEmphasis
            case '**':
                endStringReString = '\\*\\*'
                break

            // InterpretedText or HyperlinkRef
            case '`':
                // ` start is ambiguous whether it is InterpretedText or HyperlinkRef
                // Need to see if endString is ` or `_ or `__
                endStringReString = '`__?|`'
                break

            // InlineLiteral
            case '``':
                endStringReString = '``'
                isInlineLiteral = true
                break

            // SubstitutionRef
            case '|':
                endStringReString = '\\|'
                break

            // InlineInternalTarget
            case '_`':
                endStringReString = '`'
                break

            // FootnoteRef
            case '[':
                endStringReString = '\\]_'
                break

            default:
                throw new RstParserError(this, `Unrecognized startString:${startString}`)
        }

        return new RegExp(
            // Preceded by non-whitespace or escaped whitespace
            '(?<=\\S|\\\\\\s)' +

            (
                isInlineLiteral
                    ? ''            // InlineLiteral can end with escape slash before endString e.g. ``This text ends with escape slash\``
                    : '(?<!\\\\)'   // Not preceded by escape slash if it's not inline literal
            ) +

            // Match inline markup end string
            '(?<endString>' +
                endStringReString +
            ')' +

            // Role for InterpretedText
            `(?::(?<roleSuffix>${interpretedTextRoleRe.source}):)?` +

            // Assert lookahead char
            this._inlineMarkupEndLookaheadReStr,
        )
    }

    private isValidInterpretedText(rawBodyText: string, role?: string): boolean {
        if (role === undefined) {
            return true
        }

        for (const plugin of this._compiler.plugins) {
            const isValid = plugin.isValidInterpretedText?.(rawBodyText, role)
            if (typeof isValid === 'boolean') {
                return isValid
            }
        }

        return interpretedTextRoleRe.test(role)
    }
}
