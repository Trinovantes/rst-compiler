import { DocumentNode } from './Document/DocumentNode.js'
import { ParagraphNode } from './Block/ParagraphNode.js'
import { sectionRe, SectionNode, sectionChars } from './Document/SectionNode.js'
import { RstNode, RstNodeType } from './RstNode.js'
import { BulletListNode, bulletListRe } from './List/BulletListNode.js'
import { BlockquoteAttributionNode, BlockquoteNode, blockquoteAttributonRe } from './Block/BlockquoteNode.js'
import { emptyCommentRe } from './ExplicitMarkup/CommentNode.js'
import { Token } from '@/Lexer/Token.js'
import { tokenizeInput } from '@/Lexer/tokenizeInput.js'
import { TransitionNode, transitionRe } from './Document/TransitionNode.js'
import { ListItemNode } from './List/ListItemNode.js'
import { EnumeratedListNode, enumeratedListRe } from './List/EnumeratedListNode.js'
import { getEnumeratedListType, isSequentialBullet } from './List/EnumeratedListType.js'
import { DefinitionListItemNode, DefinitionListNode, definitionListRe } from './List/DefinitionList.js'

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

    private get _length(): number {
        if (this._tokens.length === 0) {
            return 0
        }

        const lastLine = this._tokens[this._tokens.length - 1]
        return lastLine.idx + lastLine.len
    }

    private get _inputIdx(): number {
        return this.peek()?.idx ?? this._length
    }

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

    private peekIsIndented(expectedIndentSize: number, offset = 0): boolean {
        if (expectedIndentSize === 0) {
            return true
        }

        const nextToken = this.peek(offset)
        if (!nextToken) {
            return false
        }

        return new RegExp(`^[ ]{${expectedIndentSize}}([^\n]*)$`).test(nextToken.str)
    }

    // ------------------------------------------------------------------------
    // Node Parsers
    // ------------------------------------------------------------------------

    parse(input: string): DocumentNode {
        this._tokenIdx = 0
        this._tokens = tokenizeInput(input)
        this._sectionMarkers = []

        const nodes = this.parseBodyElements(0, RstNodeType.Document)

        const startLineIdx = 0
        const endLineIdx = this._tokenIdx
        const startIdx = 0
        const endIdx = this._inputIdx

        return new DocumentNode({ startLineIdx, endLineIdx, startIdx, endIdx }, nodes)
    }

    private parseBodyElements(indentSize: number, parentType: RstNodeType): Array<RstNode> {
        const nodes = new Array<RstNode>()

        // eslint-disable-next-line no-labels
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
            if (parentType !== RstNodeType.Document && !this.peekIsIndented(indentSize)) {
                break
            }

            // Exit if we are inside Blockquote and just consumed a BlockquoteAttribution
            if (parentType === RstNodeType.Blockquote && nodes.at(-1)?.type === RstNodeType.BlockquoteAttribution) {
                break
            }

            // Try and parse next line
            // If a function is not applicable, it returns null and we continue down the chain until we reach Paragraph as fallback
            const nextNode =
                this.parseBlockquoteAttribution(indentSize, parentType) ??
                this.parseBlockquote(indentSize) ??
                this.parseBulletList(indentSize) ??
                this.parseEnumeratedList(indentSize) ??
                this.parseDefinitionList(indentSize) ??
                this.parseTransition() ??
                this.parseSection() ??
                this.parseParagraph(indentSize)

            nodes.push(nextNode)
        }

        return nodes
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#paragraphs
    private parseParagraph(indentSize: number): ParagraphNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const lines = new Array<Token>()
        while (this.peekIsContent()) {
            const line = this.consume()
            lines.push(line)
        }
        const paragraphText = lines.map((line) => line.str.substring(indentSize)).join('\n')

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new ParagraphNode(
            {
                startLineIdx,
                endLineIdx,
                startIdx,
                endIdx,
            },
            paragraphText,
        )
    }

    private parseTransition(): TransitionNode | null {
        if (!this.peekTest(transitionRe)) {
            return null
        }

        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        this.consume()

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new TransitionNode({
            startLineIdx,
            endLineIdx,
            startIdx,
            endIdx,
        })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#sections
    private parseSection(): SectionNode | null {
        let hasOverline: boolean
        if (this.peekTest(sectionRe, 0) && this.peekTest(sectionRe, 2)) {
            hasOverline = true
        } else if (this.peekTest(sectionRe, 1)) {
            hasOverline = false
        } else {
            return null
        }

        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const overLineChar = hasOverline ? this.consume()?.str[0] : null // Overline section has no meaning (purely aesthetic)
        const sectionText = this.consume()?.str
        const underLineChar = this.consume()?.str[0]

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

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

        return new SectionNode(
            sectionLevel,
            {
                startLineIdx,
                endLineIdx,
                startIdx,
                endIdx,
            },
            sectionText,
        )
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
    private parseBulletList(indentSize: number): BulletListNode | null {
        const firstBulletMatches = this.peekTest(bulletListRe)
        if (!firstBulletMatches) {
            return null
        }

        // Check second line (if exists) to see if this is a valid list vs ordinary paragraph that happens to start with same characters as a bullet
        const firstBulletAndSpace = firstBulletMatches[1]
        const firstBulletBodyIndentSize = indentSize + firstBulletAndSpace.length
        if (this.peekIsContent(1) && !this.peekIsIndented(firstBulletBodyIndentSize, 1)) {
            return null
        }

        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const listItems = new Array<ListItemNode>()
        while (this.canConsume() && this.peekIsIndented(indentSize)) {
            const firstLineMatches = this.peekTest(bulletListRe)
            if (!firstLineMatches) {
                break
            }

            const bulletAndSpace = firstLineMatches[1]
            const bulletIndentSize = indentSize + bulletAndSpace.length

            // Actual bullet excluding formating
            // e.g. "- text" extracts "-"
            const bulletValue = firstLineMatches[2]

            // Need to extract first line with regex since it starts with bullet and space
            // e.g. "1. text" extracts "text"
            const firstLineText = firstLineMatches.at(-1) ?? ''

            const listItem = this.parseListItem(bulletIndentSize, bulletValue, firstLineText)
            listItems.push(listItem)
        }

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new BulletListNode({ startLineIdx, endLineIdx, startIdx, endIdx }, listItems)
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#enumerated-lists
    private parseEnumeratedList(indentSize: number): EnumeratedListNode | null {
        const firstBulletMatches = this.peekTest(enumeratedListRe)
        if (!firstBulletMatches) {
            return null
        }

        // Check second line (if exists) to see if this is a valid list vs ordinary paragraph that happens to start with same characters as a bullet
        const firstBulletAndSpace = firstBulletMatches[1]
        const firstBulletBodyIndentSize = indentSize + firstBulletAndSpace.length
        if (this.peekIsContent(1) && !this.peekIsIndented(firstBulletBodyIndentSize, 1)) {
            return null
        }

        const firstBulletValue = firstBulletMatches[2]
        const firstBulletListType = getEnumeratedListType(firstBulletValue)

        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const listItems = new Array<ListItemNode>()
        while (this.canConsume() && this.peekIsIndented(indentSize)) {
            const firstLineMatches = this.peekTest(enumeratedListRe)
            if (!firstLineMatches) {
                break
            }

            const bulletAndSpace = firstLineMatches[1]
            const bulletIndentSize = indentSize + bulletAndSpace.length

            // Actual bullet excluding formating
            // e.g. "1. text" extracts "1"
            const bulletValue = firstLineMatches[2]
            const bulletListType = getEnumeratedListType(bulletValue)
            if (bulletListType !== firstBulletListType) {
                break
            }
            const prevBulletValue = listItems.at(-1)?.bullet
            if (!isSequentialBullet(bulletListType, bulletValue, prevBulletValue)) {
                break
            }

            // Need to extract first line with regex since it starts with bullet and space
            // e.g. "1. text" extracts "text"
            const firstLineText = firstLineMatches.at(-1) ?? ''

            const listItem = this.parseListItem(bulletIndentSize, bulletValue, firstLineText)
            listItems.push(listItem)
        }

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new EnumeratedListNode(firstBulletListType, { startLineIdx, endLineIdx, startIdx, endIdx }, listItems)
    }

    // https://docutils.sourceforge.io/docs/ref/doctree.html#list-item
    private parseListItem(indentSize: number, bulletValue: string, firstLineText: string): ListItemNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        this.consume()

        // Treat first child of list as paragraph
        let firstParagraphText = firstLineText
        while (this.peekIsContent() && this.peekIsIndented(indentSize)) {
            const line = this.consume()
            const lineText = line.str.substring(indentSize)
            firstParagraphText += '\n' + lineText
        }

        const firstParagraph = new ParagraphNode(
            {
                startLineIdx,
                endLineIdx: this._tokenIdx,
                startIdx,
                endIdx: startIdx + firstParagraphText.length,
            },
            firstParagraphText,
        )

        // Parse rest of list's elements (if any)
        const restOfList = this.parseBodyElements(indentSize, RstNodeType.ListItem)

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new ListItemNode(bulletValue, { startLineIdx, endLineIdx, startIdx, endIdx }, [
            firstParagraph,
            ...restOfList,
        ])
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#definition-lists
    private parseDefinitionList(indentSize: number): DefinitionListNode | null {
        // If line starts with escape character, do not parse as DefinitionList
        if (this.peekTest(/^\\/)) {
            return null
        }

        // Definition must be immediately after term and indented
        if (!this.peekTest(definitionListRe) || !this.peekIsIndented(indentSize + this._indentationSize, 1)) {
            return null
        }

        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const definitionItems = new Array<DefinitionListItemNode>()
        while (this.canConsume()) {
            const listItem = this.parseDefinitionListItem(indentSize)
            if (!listItem) {
                break
            }

            definitionItems.push(listItem)
        }

        if (definitionItems.length === 0) {
            return null
        }

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new DefinitionListNode({ startLineIdx, endLineIdx, startIdx, endIdx }, definitionItems)
    }

    private parseDefinitionListItem(indentSize: number): DefinitionListItemNode | null {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const termMatches = definitionListRe.exec(this.consume().str)
        if (!termMatches) {
            throw new Error('Failed to parseDefinitionListItem')
        }

        const termAndClassifiers = termMatches[1].split(' : ')
        const term = termAndClassifiers[0]
        const classifiers = termAndClassifiers.slice(1)

        const defBodyIndentSize = indentSize + this._indentationSize
        const defBodyNodes = this.parseBodyElements(defBodyIndentSize, RstNodeType.DefinitionListItem)

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new DefinitionListItemNode(term, classifiers, defBodyNodes, { startLineIdx, endLineIdx, startIdx, endIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquote(indentSize: number): BlockquoteNode | null {
        const bodyIndentSize = indentSize + this._indentationSize
        if (!this.peekIsIndented(bodyIndentSize)) {
            return null
        }

        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const bodyNodes = this.parseBodyElements(bodyIndentSize, RstNodeType.Blockquote)

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new BlockquoteNode({ startLineIdx, endLineIdx, startIdx, endIdx }, bodyNodes)
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquoteAttribution(indentSize: number, parentType: RstNodeType): BlockquoteAttributionNode | null {
        if (parentType !== RstNodeType.Blockquote) {
            return null
        }

        const firstLineMatches = this.peekTest(blockquoteAttributonRe)
        if (!firstLineMatches) {
            return null
        }

        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

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
        const endIdx = this._inputIdx

        return new BlockquoteAttributionNode(
            {
                startLineIdx,
                endLineIdx,
                startIdx,
                endIdx,
            },
            attributionText,
        )
    }
}
