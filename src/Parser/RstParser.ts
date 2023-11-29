import { DocumentNode } from './Block/DocumentNode.js'
import { ParagraphNode } from './Block/ParagraphNode.js'
import { sectionRe, SectionNode, sectionChars } from './Block/SectionNode.js'
import { RstNode, RstNodeType } from './RstNode.js'
import { BulletListNode, bulletListRe } from './Block/BulletListNode.js'
import { ListItemNode } from './Block/ListItemNode.js'
import { BlockquoteNode, blockquoteRe, isBlockquoteAttribution } from './Block/BlockquoteNode.js'
import { emptyCommentRe } from './Block/CommentNode.js'
import { Token } from '@/Lexer/Token.js'
import { tokenizeInput } from '@/Lexer/tokenizeInput.js'

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

        const nodes = this.parseBodyElements(0)

        const startLineIdx = 0
        const endLineIdx = this._tokenIdx
        const startIdx = 0
        const endIdx = this._inputIdx

        return new DocumentNode({ startLineIdx, endLineIdx, startIdx, endIdx }, nodes)
    }

    private parseBodyElements(currentIndentSize: number, shouldStop?: (prevNode?: RstNode) => boolean): Array<RstNode> {
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
            if (currentIndentSize > 0 && this.peekTest(emptyCommentRe)) {
                this.consume() // Consume the empty comment
                break
            }

            // Exit if we are inside a construct but encounter a new block without the same indentation
            if (currentIndentSize > 0 && !this.peekIsIndented(currentIndentSize)) {
                break
            }

            if (shouldStop?.(nodes.at(-1))) {
                break
            }

            // Parse based on current state of input
            switch (true) {
                case (this.peekTest(bulletListRe)): {
                    nodes.push(this.parseBulletList())
                    break
                }

                case (this.peekTest(sectionRe, 0) && this.peekTest(sectionRe, 2)): {
                    nodes.push(this.parseSection(true))
                    break
                }
                case (this.peekTest(sectionRe, 1)): {
                    nodes.push(this.parseSection(false))
                    break
                }

                // If next line has extra indentation, then treat it as blockquote
                case (this.peekIsIndented(currentIndentSize + this._indentationSize)): {
                    nodes.push(this.parseBlockquote())
                    break
                }

                default: {
                    nodes.push(this.parseParagraph())
                }
            }
        }

        return nodes
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
    private parseBulletList(): BulletListNode {
        const indent = bulletListRe.exec(this.peek()?.str ?? '')?.[1] // TODO fix indent detection
        if (!indent) {
            throw new Error('Failed to parseBulletList')
        }

        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const listItems = new Array<ListItemNode>()
        while (this.peekTest(bulletListRe)) {
            const listItem = this.parseListItem(indent.length)
            listItems.push(listItem)
        }

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new BulletListNode({ startLineIdx, endLineIdx, startIdx, endIdx }, listItems)
    }

    // https://docutils.sourceforge.io/docs/ref/doctree.html#list-item
    private parseListItem(expectedIndentSize: number): ListItemNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const firstLine = this.consume()
        let firstParagraphStr = bulletListRe.exec(firstLine.str)?.[2]
        if (!firstParagraphStr) {
            throw new Error('Failed to parseListItem')
        }

        while (this.peekIsContent() && this.peekIsIndented(expectedIndentSize)) {
            const line = this.consume()
            firstParagraphStr += line.str
        }

        const firstParagraph = new ParagraphNode(
            {
                startLineIdx,
                endLineIdx: this._tokenIdx,
                startIdx,
                endIdx: startIdx + firstParagraphStr.length,
            },
            firstParagraphStr,
        )
        const restOfList = this.parseBodyElements(expectedIndentSize)

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new ListItemNode({ startLineIdx, endLineIdx, startIdx, endIdx }, [
            firstParagraph,
            ...restOfList,
        ])
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#sections
    private parseSection(hasOverline: boolean): SectionNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const overLine = hasOverline ? this.consume()?.str[0] : null // Overline section has no meaning (purely aesthetic)
        const textStartLineIdx = this._tokenIdx
        const textLine = this.consume()
        const underLine = this.consume()?.str[0]

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        if (overLine !== null && overLine !== underLine) {
            throw new Error(`Section overLine:${overLine} does not match underLine:${underLine}`)
        }
        if (!sectionChars.includes(underLine)) {
            throw new Error(`Invalid underLine:${underLine}`)
        }

        // Register the marker if it has not been seen yet
        if (!this._sectionMarkers.includes(underLine)) {
            this._sectionMarkers.push(underLine)
        }

        // Get 1-based index of the marker
        const sectionLevel = this._sectionMarkers.indexOf(underLine) + 1

        return new SectionNode(
            {
                startLineIdx,
                endLineIdx,
                startIdx,
                endIdx,
            },
            textStartLineIdx,
            textLine,
            sectionLevel,
        )
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
    private parseBlockquote(): BlockquoteNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const indent = blockquoteRe.exec(this.peek()?.str ?? '')?.[1]
        if (!indent) {
            throw new Error('Failed to parseBlockquote')
        }

        const nodes = this.parseBodyElements(indent.length, (prevNode) => {
            if (prevNode?.type !== RstNodeType.Paragraph) {
                return false
            }

            return isBlockquoteAttribution(indent, prevNode)
        })

        const endLineIdx = this._tokenIdx
        const endIdx = this._inputIdx

        return new BlockquoteNode({ startLineIdx, endLineIdx, startIdx, endIdx }, nodes, indent)
    }

    // https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#paragraphs
    private parseParagraph(): ParagraphNode {
        const startLineIdx = this._tokenIdx
        const startIdx = this._inputIdx

        const lines = new Array<Token>()
        while (this.peekIsContent()) {
            const line = this.consume()
            lines.push(line)
        }

        const endLineIdx = this._tokenIdx
        const origStr = lines.map((line) => line.str).join('\n')

        return new ParagraphNode(
            {
                startLineIdx,
                endLineIdx,
                startIdx,
                endIdx: startIdx + origStr.length,
            },
            origStr,
        )
    }
}
