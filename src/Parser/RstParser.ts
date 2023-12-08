import { Document } from './Document/Document.js'
import { Paragraph } from './Block/Paragraph.js'
import { RstNode, RstNodeType } from './RstNode.js'
import { BulletList } from './List/BulletList.js'
import { Blockquote } from './Block/Blockquote.js'
import { BlockquoteAttribution } from './Block/BlockquoteAttribution.js'
import { Token } from '@/Lexer/Token.js'
import { tokenizeInput } from '@/Lexer/tokenizeInput.js'
import { BulletListItem } from './List/BulletListItem.js'
import { EnumeratedList } from './List/EnumeratedList.js'
import { getEnumeratedListType, isSequentialBullet } from './List/EnumeratedListType.js'
import { DefinitionList } from './List/DefinitionList.js'
import { escapeForRegExp } from '@/utils/escapeForRegExp.js'
import { OptionListItem, OptionListItemOption } from './List/OptionListItem.js'
import { Section } from './Document/Section.js'
import { DefinitionListItem } from './List/DefinitionListItem.js'
import { FieldList } from './List/FieldList.js'
import { FieldListItem } from './List/FieldListItem.js'
import { OptionList } from './List/OptionList.js'
import { Transition } from './Document/Transition.js'
import { LiteralBlock } from './Block/LiteralBlock.js'
import { LineBlock } from './Block/LineBlock.js'

// ------------------------------------------------------------------------
// Regular expressions used for parsing lines (excluding \n)
// ------------------------------------------------------------------------

export const romanUpperRe = /(I+|[MDCLXVI]{2,})/
export const romanLowerRe = /(i+|[mdclxvi]{2,})/

export const sectionChars = ['=', '-', '`', ':', '.', "'", '"', '~', '^', '_', '*', '+', '#']
export const sectionMarkRe    = new RegExp(`^(${sectionChars.map(escapeForRegExp).join('|')}){3,}[ ]*$`)
export const transitionMarkRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).join('|')}){4,}[ ]*$`)

export const definitionListItemRe = /^[ ]*(.+)$/
export const fieldListItemRe      = /^[ ]*(:(.+): )(.+)$/
export const bulletListItemRe     = /^[ ]*(([*+-])[ ]+)(.+)$/
export const enumeratedListItemRe = new RegExp(
    '^[ ]*' + // Whitespace at start
    '(' +
        '\\(?' + // Opening parenthesis
        '(' +
            '[0-9]+' + // Arabic
            '|' +
            '[A-Za-z]' + // Alphabet
            '|' +
            '#' + // Auto enumerator
            '|' +
            romanUpperRe.source + // Roman Numerals (uppercase)
            '|' +
            romanLowerRe.source + // Roman Numerals (lowercase)
        ')' +
        '[)\\.]' + // Closing parenthesis or period
        ' ' + // Space
    ')' +
    '(.+)$', // Any char to end of line
)

export const optionListItemOptionArgRe = /[a-zA-Z][a-zA-Z0-9_-]*|<.+>/
export const optionListItemOptionRe = new RegExp(
    '(' +
        `-([a-zA-Z0-9])([ ])(${optionListItemOptionArgRe.source})?` + // Short form (delimiter must be space)
    '|' +
        `--([a-zA-Z-]+)([ |=])(${optionListItemOptionArgRe.source})?` + // Long form (delimiter can either be equals or space)
    ')',
)
export const optionListItemRe = new RegExp(
    '^[ ]*' + // Whitespace at start
    '-{1,2}' + // 1 or 2 dashes
    '[^- ]' + // Next character cannot be a dash (since 3+ dashes need to be parsed as transition/section) or space (since 1 dash+space need to be parsed as bullet list)
    '.+$', // Any char to end of line
)

export const emptyCommentRe = /^\.\.\s*$/

export const quotedLiteralBlockRe   = /^([ ]*)>+(?: .+)?$/
export const lineBlockRe            = /^([ ]*)\| (.+)$/
export const blockquoteAttributonRe = /^([ ]*)(---?[ ]+)(.+)$/

// ------------------------------------------------------------------------
// Main Parser
// ------------------------------------------------------------------------

export class RstParser {
    // Parser internal states
    // All of these fields need to be reset at the start of parse()
    private _tokenIdx = 0xDEADBEEF
    private _tokens = new Array<Token>()
    private _sectionMarkers = new Array<string>() // Markers are determined in the order that they appear i.e. first marker is h1, second marker is h2, etc.

    constructor(
        private readonly _indentationSize = 4,
    ) {}

    // ------------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------------

    private consume(): Token {
        if (!this.canConsume()) {
            throw new Error(`Invalid tokenIdx:${this._tokenIdx}`)
        }

        return this._tokens[this._tokenIdx++]
    }

    private canConsume(offset = 0): boolean {
        const idx = this._tokenIdx + offset
        return idx >= 0 && idx < this._tokens.length
    }

    private peek(offset = 0): Token | null {
        const idx = this._tokenIdx + offset
        if (idx < 0 || idx >= this._tokens.length) {
            return null
        }

        return this._tokens[idx]
    }

    private peekIsNewLine(): boolean {
        const nextToken = this.peek()
        if (!nextToken) {
            return false
        }

        return nextToken.len === 0
    }

    private peekIsContent(offset = 0): boolean {
        const nextToken = this.peek(offset)
        if (!nextToken) {
            return false
        }

        return nextToken.len > 0
    }

    private peekTest(re: RegExp, offset = 0): RegExpExecArray | null {
        const nextToken = this.peek(offset)
        if (!nextToken) {
            return null
        }

        return re.exec(nextToken.str)
    }

    private peekIndentSize(offset = 0): number {
        return this.peek(offset)?.str.search(/\S|$/) ?? 0
    }

    private peekIsIndented(expectedIndentSize: number, offset = 0): boolean {
        return this.peekIndentSize(offset) === expectedIndentSize
    }

    // ------------------------------------------------------------------------
    // Node Parsers
    // ------------------------------------------------------------------------

    parse(input: string): Document {
        this._tokenIdx = 0
        this._tokens = tokenizeInput(input)
        this._sectionMarkers = []

        const nodes = this.parseBodyElements(0, RstNodeType.Document)

        const startLineIdx = 0
        const endLineIdx = this._tokenIdx

        return new Document({ startLineIdx, endLineIdx }, nodes)
    }

    private parseBodyElements(indentSize: number, parentType: RstNodeType): Array<RstNode> {
        const nodes = new Array<RstNode>()

        while (true) {
            // Consume all blank lines before parsing next block
            while (this.peekIsNewLine()) {
                this.consume()
            }

            // Exit when we're out of lines to consume
            if (!this.canConsume()) {
                break
            }

            // Exit if we are inside a construct and encounted an empty comment
            if (parentType !== RstNodeType.Document && this.peekTest(emptyCommentRe)) {
                this.consume() // Consume the empty comment
                break
            }

            // Exit if we are inside a construct but encounter a new block without the same indentation
            if (parentType !== RstNodeType.Document && this.peekIndentSize() < indentSize) {
                break
            }

            // Exit if we are inside Blockquote and just consumed a BlockquoteAttribution
            if (parentType === RstNodeType.Blockquote && nodes.at(-1)?.type === RstNodeType.BlockquoteAttribution) {
                break
            }

            // Try and parse next line
            // If a function is not applicable, it returns null and we continue down the chain until we reach Paragraph as fallback
            const nextNode =
                this.parseBulletList(indentSize) ??
                this.parseEnumeratedList(indentSize) ??
                this.parseFieldList(indentSize) ??
                this.parseOptionList(indentSize) ??
                this.parseDefinitionList(indentSize) ??

                this.parseLiteralBlock(indentSize, nodes.at(-1)) ??
                this.parseLineBlock(indentSize) ??
                this.parseBlockquoteAttribution(indentSize, parentType) ??
                this.parseBlockquote(indentSize) ??

                this.parseTransition() ??
                this.parseSection() ??
                this.parseParagraph(indentSize)

            if (nextNode.type === RstNodeType.LiteralBlock) {
                const prevParagraph = nodes.pop()
                if (!prevParagraph) {
                    throw new Error('Invalid prevParagraph')
                }

                const prevParagraphText = prevParagraph.getTextContent()
                if (prevParagraphText === '::') {
                    // No additional action needed since the lone "::" paragraph has already been popped
                    // Delete the lone "::" paragraph that denotes that current node is a literal block
                } else if (prevParagraphText.endsWith(' ::')) {
                    // If prev paragraph ends with " ::", then we need to put the paragraph back with the " ::" removed
                    nodes.push(new Paragraph(prevParagraphText.substring(0, prevParagraphText.length - 3), prevParagraph.source))
                } else if (prevParagraphText.endsWith('::')) {
                    // Else prev paragraph ends with "anytext::" and we need to put the paragraph back with "::" replaced with ":" (basically delete the last character)
                    nodes.push(new Paragraph(prevParagraphText.substring(0, prevParagraphText.length - 1), prevParagraph.source))
                } else {
                    throw new Error('Invalid prevParagraph')
                }
            }

            nodes.push(nextNode)
        }

        return nodes
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#paragraphs
    private parseParagraph(indentSize: number): Paragraph {
        const startLineIdx = this._tokenIdx

        let paragraphText = ''
        while (this.peekIsContent()) {
            const line = this.consume()
            paragraphText += line.str.substring(indentSize) + '\n'
        }

        const endLineIdx = this._tokenIdx
        return new Paragraph(paragraphText.trim(), { startLineIdx, endLineIdx }) // Need trim to remove last '\n'
    }

    private parseTransition(): Transition | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekTest(transitionMarkRe)) {
            return null
        }

        // Consume the transition line
        this.consume()

        const endLineIdx = this._tokenIdx
        return new Transition({ startLineIdx, endLineIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#sections
    private parseSection(): Section | null {
        const startLineIdx = this._tokenIdx

        let hasOverline: boolean
        if (this.peekTest(sectionMarkRe, 0) && this.peekTest(sectionMarkRe, 2)) {
            hasOverline = true
        } else if (this.peekTest(sectionMarkRe, 1)) {
            hasOverline = false
        } else {
            return null
        }

        const overLineChar = hasOverline ? this.consume()?.str[0] : null // Overline section has no meaning (purely aesthetic)
        const sectionText = this.consume()?.str
        const underLineChar = this.consume()?.str[0]

        if (hasOverline && overLineChar !== underLineChar) {
            throw new Error(`Section overLine:${overLineChar} does not match underLine:${underLineChar}`)
        }
        if (!sectionChars.includes(underLineChar)) {
            throw new Error(`Invalid underLine:${underLineChar}`)
        }

        // Register the marker if it has not been seen yet
        if (!this._sectionMarkers.includes(underLineChar)) {
            this._sectionMarkers.push(underLineChar)
        }

        // Get 1-based index of the marker
        const sectionLevel = this._sectionMarkers.indexOf(underLineChar) + 1

        const endLineIdx = this._tokenIdx
        return new Section(sectionLevel, sectionText, { startLineIdx, endLineIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
    private parseBulletList(indentSize: number): BulletList | null {
        const startLineIdx = this._tokenIdx

        const listItems = new Array<BulletListItem>()
        while (true) {
            const listItem = this.parseBulletListItem(indentSize)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        // Failed to parse any bullet list items thus this is not a bullet list
        if (listItems.length === 0) {
            return null
        }

        const endLineIdx = this._tokenIdx
        return new BulletList({ startLineIdx, endLineIdx }, listItems)
    }

    private parseBulletListItem(indentSize: number): BulletListItem | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = this.peekTest(bulletListItemRe)
        if (!firstLineMatches) {
            return null
        }

        const bulletAndSpace = firstLineMatches[1]
        const bulletValue = firstLineMatches[2] // Actual bullet excluding formating e.g. "- text" extracts "-"
        const bulletIndentSize = indentSize + bulletAndSpace.length

        // Check second line (if exists) to see if this is a valid list vs ordinary paragraph that happens to start with same characters as a bullet
        if (this.peekIsContent(1) && !this.peekIsIndented(bulletIndentSize, 1)) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        this.consume()

        // First child of list is always paragraph
        // Need to extract first line's text with regex since it starts with bullet and space
        // e.g. "- text" extracts "text"
        let firstParagraphText = firstLineMatches.at(-1) ?? ''
        while (this.peekIsContent() && this.peekIsIndented(bulletIndentSize)) {
            const line = this.consume()
            const lineText = line.str.substring(bulletIndentSize)
            firstParagraphText += '\n' + lineText
        }

        const firstParagraph = new Paragraph(firstParagraphText, { startLineIdx, endLineIdx: this._tokenIdx })
        const restOfList = this.parseBodyElements(bulletIndentSize, RstNodeType.BulletListItem)

        const endLineIdx = this._tokenIdx
        return new BulletListItem(bulletValue, { startLineIdx, endLineIdx }, [
            firstParagraph,
            ...restOfList,
        ])
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#enumerated-lists
    private parseEnumeratedList(indentSize: number): EnumeratedList | null {
        const startLineIdx = this._tokenIdx

        const listItems = new Array<BulletListItem>()
        while (true) {
            const prevBulletValue = listItems.at(-1)?.bullet
            const listItem = this.parseEnumeratedListItem(indentSize, prevBulletValue)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        // Failed to parse any enumerated list items thus this is not an enumerated list
        if (listItems.length === 0) {
            return null
        }

        const listType = getEnumeratedListType(listItems[0].bullet)
        const endLineIdx = this._tokenIdx
        return new EnumeratedList(listType, { startLineIdx, endLineIdx }, listItems)
    }

    private parseEnumeratedListItem(indentSize: number, prevBulletValue?: string): BulletListItem | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = this.peekTest(enumeratedListItemRe)
        if (!firstLineMatches) {
            return null
        }

        const bulletAndSpace = firstLineMatches[1]
        const bulletValue = firstLineMatches[2] // Actual bullet excluding formating e.g. "1. text" extracts "1"
        const bulletIndentSize = indentSize + bulletAndSpace.length

        // Check second line (if exists) to see if this is a valid list vs ordinary paragraph that happens to start with same characters as a bullet
        if (this.peekIsContent(1) && !this.peekIsIndented(bulletIndentSize, 1)) {
            return null
        }

        // Check if current bullet is sequential (e.g. 1,2,3)
        if (!isSequentialBullet(bulletValue, prevBulletValue)) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        this.consume()

        // First child of list is always paragraph
        // Need to extract first line's text with regex since it starts with bullet and space
        // e.g. "1. text" extracts "text"
        let firstParagraphText = firstLineMatches.at(-1) ?? ''
        while (this.peekIsContent() && this.peekIsIndented(bulletIndentSize)) {
            const line = this.consume()
            const lineText = line.str.substring(bulletIndentSize)
            firstParagraphText += '\n' + lineText
        }

        const firstParagraph = new Paragraph(firstParagraphText, { startLineIdx, endLineIdx: this._tokenIdx })
        const restOfList = this.parseBodyElements(bulletIndentSize, RstNodeType.BulletListItem)

        const endLineIdx = this._tokenIdx
        return new BulletListItem(bulletValue, { startLineIdx, endLineIdx }, [
            firstParagraph,
            ...restOfList,
        ])
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#definition-lists
    private parseDefinitionList(indentSize: number): DefinitionList | null {
        const startLineIdx = this._tokenIdx

        const listItems = new Array<DefinitionListItem>()
        while (true) {
            const listItem = this.parseDefinitionListItem(indentSize)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        if (listItems.length === 0) {
            return null
        }

        const endLineIdx = this._tokenIdx
        return new DefinitionList({ startLineIdx, endLineIdx }, listItems)
    }

    private parseDefinitionListItem(indentSize: number): DefinitionListItem | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        // Definition must be immediately after term and indented
        if (!this.peekTest(definitionListItemRe) || !this.peekIsIndented(indentSize + this._indentationSize, 1)) {
            return null
        }

        const termMatches = this.peekTest(definitionListItemRe)
        if (!termMatches) {
            return null
        }

        // Consume term that we've already peeked at and tested
        this.consume()

        const termAndClassifiers = termMatches[1].split(' : ')
        const term = termAndClassifiers[0]
        const classifiers = termAndClassifiers.slice(1)

        const defBodyIndentSize = indentSize + this._indentationSize
        const defBodyNodes = this.parseBodyElements(defBodyIndentSize, RstNodeType.DefinitionListItem)

        const endLineIdx = this._tokenIdx
        return new DefinitionListItem(term, classifiers, defBodyNodes, { startLineIdx, endLineIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#field-lists
    private parseFieldList(indentSize: number): FieldList | null {
        const startLineIdx = this._tokenIdx

        const listItems = new Array<FieldListItem>()
        while (true) {
            const listItem = this.parseFieldListItem(indentSize)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        if (listItems.length === 0) {
            return null
        }

        const endLineIdx = this._tokenIdx
        return new FieldList({ startLineIdx, endLineIdx }, listItems)
    }

    private parseFieldListItem(indentSize: number): FieldListItem | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = this.peekTest(fieldListItemRe)
        if (!firstLineMatches) {
            return null
        }

        const fieldName = firstLineMatches[2]

        // Field's indent size is based on next line's initial indent instead of where the colon is
        const fieldIndentSize = this.peekIsContent(1)
            ? this.peek(1)?.str.search(/\S|$/) ?? 0
            : 0

        // Consume first line that we've already peeked at and tested
        this.consume()

        // First child of list is always paragraph
        // Need to extract first line's text with regex since it starts with bullet and space
        // e.g. "1. text" extracts "text"
        let firstParagraphText = firstLineMatches.at(-1) ?? ''
        while (this.peekIsContent() && this.peekIsIndented(fieldIndentSize)) {
            const line = this.consume()
            const lineText = line.str.substring(fieldIndentSize)
            firstParagraphText += '\n' + lineText
        }

        const firstParagraph = new Paragraph(firstParagraphText, { startLineIdx, endLineIdx: this._tokenIdx })
        const fieldBodyNodes = this.parseBodyElements(fieldIndentSize, RstNodeType.FieldListItem)

        const endLineIdx = this._tokenIdx
        return new FieldListItem(
            fieldName,
            [
                firstParagraph,
                ...fieldBodyNodes,
            ],
            {
                startLineIdx,
                endLineIdx,
            },
        )
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#option-lists
    private parseOptionList(indentSize: number): OptionList | null {
        const startLineIdx = this._tokenIdx

        const listItems = new Array<OptionListItem>()
        while (true) {
            const listItem = this.parseOptionListItem(indentSize)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        if (listItems.length === 0) {
            return null
        }

        const endLineIdx = this._tokenIdx
        return new OptionList({ startLineIdx, endLineIdx }, listItems)
    }

    private parseOptionListItem(indentSize: number): OptionListItem | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = this.peekTest(optionListItemRe)
        if (!firstLineMatches) {
            return null
        }

        // Desc's indent size is based on next line's initial indent instead of where the first line starts
        const descIndentSize = this.peekIsContent(1)
            ? this.peek(1)?.str.search(/\S|$/) ?? 0
            : 0

        // Consume first line that we've already peeked at and tested
        this.consume()

        const options = new Array<OptionListItemOption>()
        const optionReWithState = new RegExp(optionListItemOptionRe, 'g')
        const matches = firstLineMatches[0].matchAll(optionReWithState)
        let parsedStrIdx = 0
        for (const match of matches) {
            parsedStrIdx = (match.index ?? 0) + match[0].length

            options.push({
                name: match[2] ?? match[5],
                delimiter: match[3] ?? match[6],
                argName: match[4] ?? match[7],
            })
        }

        let firstParagraphText = firstLineMatches[0].substring(parsedStrIdx)
        while (this.peekIsContent() && this.peekIsIndented(descIndentSize)) {
            const line = this.consume()
            const lineText = line.str.substring(descIndentSize)
            firstParagraphText += '\n' + lineText
        }

        const firstParagraph = new Paragraph(firstParagraphText.trim(), { startLineIdx, endLineIdx: this._tokenIdx })
        const fieldBodyNodes = this.parseBodyElements(descIndentSize, RstNodeType.OptionListItem)

        const endLineIdx = this._tokenIdx
        return new OptionListItem(
            options,
            [
                firstParagraph,
                ...fieldBodyNodes,
            ],
            {
                startLineIdx,
                endLineIdx,
            },
        )
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#literal-blocks
    private parseLiteralBlock(indentSize: number, prevNode?: RstNode): LiteralBlock | null {
        const startLineIdx = this._tokenIdx

        if (prevNode?.type !== RstNodeType.Paragraph) {
            return null
        }

        if (!prevNode.getTextContent().endsWith('::')) {
            return null
        }

        const indentedBlockSize = indentSize + this._indentationSize
        let literalText = ''

        if (this.peekIsIndented(indentedBlockSize)) {
            // Indented literal block must be on next level of indentation
            while (this.peekIsContent() && this.peekIsIndented(indentedBlockSize)) {
                const line = this.consume()
                literalText += line.str.substring(indentSize) + '\n'
            }
        } else if (this.peekTest(quotedLiteralBlockRe)) {
            // Quoted literal block must be on same indentation as current body
            while (this.peekIsContent() && this.peekIsIndented(indentSize) && this.peekTest(quotedLiteralBlockRe)) {
                const line = this.consume()
                literalText += line.str.substring(indentSize) + '\n'
            }
        } else {
            throw new Error('Failed to parseLiteralBlock')
        }

        const endLineIdx = this._tokenIdx
        return new LiteralBlock(literalText.trim(), { startLineIdx, endLineIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#line-blocks
    private parseLineBlock(indentSize: number): LineBlock | null {
        const startLineIdx = this._tokenIdx

        let lineBlockText = ''
        while (true) {
            if (!this.peekIsIndented(indentSize)) {
                return null
            }

            const lineMatches = this.peekTest(lineBlockRe)
            if (!lineMatches) {
                break
            }

            this.consume()
            const text = lineMatches[2]
            lineBlockText += text + '\n'
        }

        if (lineBlockText.length === 0) {
            return null
        }

        const endLineIdx = this._tokenIdx
        return new LineBlock(lineBlockText.trim(), { startLineIdx, endLineIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquote(indentSize: number): Blockquote | null {
        const startLineIdx = this._tokenIdx

        const blockIndentSize = indentSize + this._indentationSize
        if (!this.peekIsIndented(blockIndentSize)) {
            return null
        }

        const bodyNodes = this.parseBodyElements(blockIndentSize, RstNodeType.Blockquote)

        const endLineIdx = this._tokenIdx
        return new Blockquote({ startLineIdx, endLineIdx }, bodyNodes)
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquoteAttribution(indentSize: number, parentType: RstNodeType): BlockquoteAttribution | null {
        const startLineIdx = this._tokenIdx

        if (parentType !== RstNodeType.Blockquote) {
            return null
        }

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = this.peekTest(blockquoteAttributonRe)
        if (!firstLineMatches) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        this.consume()

        const bulletAndSpace = firstLineMatches[2]
        const bodyIndentSize = indentSize + bulletAndSpace.length

        // Need to extract first line with regex since it starts with bullet and space
        // e.g. "-- [text]"
        const firstLineText = firstLineMatches.at(-1) ?? ''

        let attributionText = firstLineText
        while (this.peekIsContent() && this.peekIsIndented(bodyIndentSize)) {
            const line = this.consume()
            const lineText = line.str.substring(bodyIndentSize)
            attributionText += '\n' + lineText
        }

        const endLineIdx = this._tokenIdx
        return new BlockquoteAttribution(attributionText, { startLineIdx, endLineIdx })
    }
}
