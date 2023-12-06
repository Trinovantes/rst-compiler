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
import { DefinitionListItemNode, DefinitionListNode, definitionListRe } from './List/DefinitionListNode.js'
import { FieldListItemNode, FieldListNode, fieldListRe } from './List/FieldListNode.js'

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

        return new DocumentNode({ startLineIdx, endLineIdx }, nodes)
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
                this.parseFieldList(indentSize) ??
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

        let paragraphText = ''
        while (this.peekIsContent()) {
            const line = this.consume()
            paragraphText += line.str.substring(indentSize) + '\n'
        }

        const endLineIdx = this._tokenIdx
        return new ParagraphNode(paragraphText.trim(), { startLineIdx, endLineIdx }) // Need trim to remove last '\n'
    }

    private parseTransition(): TransitionNode | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekTest(transitionRe)) {
            return null
        }

        // Consume the transition line without processing it (no need)
        this.consume()

        const endLineIdx = this._tokenIdx
        return new TransitionNode({ startLineIdx, endLineIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#sections
    private parseSection(): SectionNode | null {
        const startLineIdx = this._tokenIdx

        let hasOverline: boolean
        if (this.peekTest(sectionRe, 0) && this.peekTest(sectionRe, 2)) {
            hasOverline = true
        } else if (this.peekTest(sectionRe, 1)) {
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
        return new SectionNode(sectionLevel, sectionText, { startLineIdx, endLineIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
    private parseBulletList(indentSize: number): BulletListNode | null {
        const startLineIdx = this._tokenIdx

        const listItems = new Array<ListItemNode>()
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
        return new BulletListNode({ startLineIdx, endLineIdx }, listItems)
    }

    private parseBulletListItem(indentSize: number): ListItemNode | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = this.peekTest(bulletListRe)
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

        const firstParagraph = new ParagraphNode(firstParagraphText, { startLineIdx, endLineIdx: this._tokenIdx })
        const restOfList = this.parseBodyElements(bulletIndentSize, RstNodeType.ListItem)

        const endLineIdx = this._tokenIdx
        return new ListItemNode(bulletValue, { startLineIdx, endLineIdx }, [
            firstParagraph,
            ...restOfList,
        ])
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#enumerated-lists
    private parseEnumeratedList(indentSize: number): EnumeratedListNode | null {
        const startLineIdx = this._tokenIdx

        const listItems = new Array<ListItemNode>()
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
        return new EnumeratedListNode(listType, { startLineIdx, endLineIdx }, listItems)
    }

    private parseEnumeratedListItem(indentSize: number, prevBulletValue?: string): ListItemNode | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = this.peekTest(enumeratedListRe)
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

        const firstParagraph = new ParagraphNode(firstParagraphText, { startLineIdx, endLineIdx: this._tokenIdx })
        const restOfList = this.parseBodyElements(bulletIndentSize, RstNodeType.ListItem)

        const endLineIdx = this._tokenIdx
        return new ListItemNode(bulletValue, { startLineIdx, endLineIdx }, [
            firstParagraph,
            ...restOfList,
        ])
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#definition-lists
    private parseDefinitionList(indentSize: number): DefinitionListNode | null {
        const startLineIdx = this._tokenIdx

        const definitionItems = new Array<DefinitionListItemNode>()
        while (true) {
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
        return new DefinitionListNode({ startLineIdx, endLineIdx }, definitionItems)
    }

    private parseDefinitionListItem(indentSize: number): DefinitionListItemNode | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        // Definition must be immediately after term and indented
        if (!this.peekTest(definitionListRe) || !this.peekIsIndented(indentSize + this._indentationSize, 1)) {
            return null
        }

        const termMatches = this.peekTest(definitionListRe)
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
        return new DefinitionListItemNode(term, classifiers, defBodyNodes, { startLineIdx, endLineIdx })
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#field-lists
    private parseFieldList(indentSize: number): FieldListNode | null {
        const startLineIdx = this._tokenIdx

        const fieldItems = new Array<FieldListItemNode>()
        while (true) {
            const listItem = this.parseFieldListItemNode(indentSize)
            if (!listItem) {
                break
            }

            fieldItems.push(listItem)
        }

        if (fieldItems.length === 0) {
            return null
        }

        const endLineIdx = this._tokenIdx
        return new FieldListNode({ startLineIdx, endLineIdx }, fieldItems)
    }

    private parseFieldListItemNode(indentSize: number): FieldListItemNode | null {
        const startLineIdx = this._tokenIdx

        if (!this.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = this.peekTest(fieldListRe)
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

        const firstParagraph = new ParagraphNode(firstParagraphText, { startLineIdx, endLineIdx: this._tokenIdx })
        const fieldBodyNodes = this.parseBodyElements(fieldIndentSize, RstNodeType.FieldListItem)

        const endLineIdx = this._tokenIdx
        return new FieldListItemNode(
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

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquote(indentSize: number): BlockquoteNode | null {
        const startLineIdx = this._tokenIdx

        const bodyIndentSize = indentSize + this._indentationSize
        if (!this.peekIsIndented(bodyIndentSize)) {
            return null
        }

        const bodyNodes = this.parseBodyElements(bodyIndentSize, RstNodeType.Blockquote)

        const endLineIdx = this._tokenIdx
        return new BlockquoteNode({ startLineIdx, endLineIdx }, bodyNodes)
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquoteAttribution(indentSize: number, parentType: RstNodeType): BlockquoteAttributionNode | null {
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
        return new BlockquoteAttributionNode(attributionText, { startLineIdx, endLineIdx })
    }
}
