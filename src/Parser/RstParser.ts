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

    private peekIsContent(): boolean {
        const nextToken = this.peek()
        if (!nextToken) {
            return false
        }

        return nextToken.len > 0
    }

    private peekTest(re: RegExp, offset = 0): boolean {
        const nextToken = this.peek(offset)
        if (!nextToken) {
            return false
        }

        return re.test(nextToken.str)
    }

    private peekIsIndented(expectedIndentSize: number): boolean {
        if (expectedIndentSize === 0) {
            return true
        }

        const nextToken = this.peek()
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

            // Exit if we are inside blockquote and encounted an attribution node
            if (parentType === RstNodeType.Blockquote && this.peekTest(blockquoteAttributonRe)) {
                nodes.push(this.parseBlockquoteAttribution(indentSize))
                break
            }

            // Parse based on current state of input
            switch (true) {
                // If next line has extra indentation, then treat it as blockquote
                case this.peekIsIndented(indentSize + this._indentationSize): {
                    nodes.push(this.parseBlockquote(indentSize + this._indentationSize))
                    break
                }

                case this.peekTest(transitionRe): {
                    nodes.push(this.parseTransition())
                    break
                }

                case this.peekTest(bulletListRe): {
                    nodes.push(this.parseBulletList(indentSize))
                    break
                }

                case this.peekTest(sectionRe, 0) && this.peekTest(sectionRe, 2): {
                    nodes.push(this.parseSection(true))
                    break
                }
                case this.peekTest(sectionRe, 1): {
                    nodes.push(this.parseSection(false))
                    break
                }

                default: {
                    nodes.push(this.parseParagraph(indentSize))
                }
            }
        }

        return nodes
    }

    private parseTransition(): TransitionNode {
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
    private parseSection(hasOverline: boolean): SectionNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const overLineChar = hasOverline ? this.consume()?.str[0] : null // Overline section has no meaning (purely aesthetic)
        const sectionText = this.consume()?.str
        const underLineChar = this.consume()?.str[0]

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        if (overLineChar !== null && overLineChar !== underLineChar) {
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

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
    private parseBulletList(indentSize: number): BulletListNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const listItems = new Array<ListItemNode>()
        while (this.peekTest(bulletListRe) && this.peekIsIndented(indentSize)) {
            const listItem = this.parseListItem(indentSize, bulletListRe)
            listItems.push(listItem)
        }

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new BulletListNode({ startLineIdx, endLineIdx, startIdx, endIdx }, listItems)
    }

    // https://docutils.sourceforge.io/docs/ref/doctree.html#list-item
    private parseListItem(indentSize: number, listItemRe: RegExp) {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const firstLine = this.consume()
        const firstLineMatches = listItemRe.exec(firstLine.str)
        if (!firstLineMatches) {
            throw new Error('Failed to parseListItem')
        }

        const bulletAndSpace = firstLineMatches[2]
        const bullet = bulletAndSpace.trim()
        const listBodyIndentSize = indentSize + bulletAndSpace.length

        // Need to extract first line with regex since it starts with bullet and space
        // e.g. "- [text]"
        const firstLineText = firstLineMatches[3]

        // Treat first child of list as paragraph
        let firstParagraphText = firstLineText
        while (this.peekIsContent() && this.peekIsIndented(listBodyIndentSize)) {
            const line = this.consume()
            const lineText = line.str.substring(listBodyIndentSize)
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
        const restOfList = this.parseBodyElements(listBodyIndentSize, RstNodeType.ListItem)

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new ListItemNode(bullet, { startLineIdx, endLineIdx, startIdx, endIdx }, [
            firstParagraph,
            ...restOfList,
        ])
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquote(indentSize: number): BlockquoteNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const bodyNodes = this.parseBodyElements(indentSize, RstNodeType.Blockquote)

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new BlockquoteNode({ startLineIdx, endLineIdx, startIdx, endIdx }, bodyNodes)
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquoteAttribution(indentSize: number): BlockquoteAttributionNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const firstLine = this.consume()
        const firstLineMatches = blockquoteAttributonRe.exec(firstLine.str)
        if (!firstLineMatches) {
            throw new Error('Failed to parseBlockquoteAttribution')
        }

        const bulletAndSpace = firstLineMatches[2]
        const bodyIndentSize = indentSize + bulletAndSpace.length

        // Need to extract first line with regex since it starts with bullet and space
        // e.g. "-- [text]"
        const firstLineText = firstLineMatches[3]

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
