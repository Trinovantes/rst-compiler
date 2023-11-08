import { Line } from '@/Lexer/Line.js'
import { splitLines } from '@/Lexer/splitLines.js'
import { DocumentNode } from './Node/DocumentNode.js'
import { ParagraphNode } from './Node/ParagraphNode.js'
import { sectionRe, SectionNode, sectionChars } from './Node/SectionNode.js'
import { RstNode } from './RstNode.js'

export class RstParser {
    constructor(
        private _lineIdx = 0xDEADBEEF,
        private _lines = new Array<Line>(),

        // Markers are determined in the order that they appear
        // i.e. First marker is h1, second marker is h2, etc.
        private _sectionMarkers = new Array<string>(),
    ) {}

    private canConsume(): boolean {
        return this._lineIdx >= 0 && this._lineIdx < this._lines.length
    }

    private peek(offset = 0): Line | null {
        const idx = this._lineIdx + offset
        if (idx < 0 || idx >= this._lines.length) {
            return null
        }

        return this._lines[idx]
    }

    private consume(): Line {
        if (!this.canConsume()) {
            throw new Error(`Invalid lineIdx:${this._lineIdx}`)
        }

        return this._lines[this._lineIdx++]
    }

    parse(input: string): DocumentNode {
        const nodes = new Array<RstNode>()

        this._lineIdx = 0
        this._lines = splitLines(input)
        this._sectionMarkers = []

        while (this.canConsume()) {
            // Consume all blank lines before parsing next block
            while (this.peek()?.len === 0) {
                this.consume()
            }

            // Transition the state machine based on current line
            switch (true) {
                // TODO

                case (sectionRe.test(this.peek()?.str ?? '') && sectionRe.test(this.peek(2)?.str ?? '')): {
                    nodes.push(this.parseSection(true))
                    break
                }
                case (sectionRe.test(this.peek(1)?.str ?? '')): {
                    nodes.push(this.parseSection(false))
                    break
                }

                default: {
                    nodes.push(this.parseParagraph())
                }
            }
        }

        const endIdx = nodes.at(-1)?.endIdx ?? 0
        const endLine = nodes.at(-1)?.endLine ?? 0
        return new DocumentNode(0, endIdx, 0, endLine, nodes)
    }

    private parseSection(hasOverline: boolean): SectionNode {
        // Overline section has no meaning (purely aesthetic)
        const overLine = hasOverline ? this.consume().str[0] : null
        const textLine = this.consume()
        const underLine = this.consume().str[0]

        if (overLine !== null && overLine !== underLine) {
            throw new Error(`Section overLine:${overLine} does not match underLine:${underLine}`)
        }
        if (!sectionChars.includes(underLine)) {
            throw new Error(`Invalid underLine:${underLine}`)
        }

        if (!this._sectionMarkers.includes(underLine)) {
            this._sectionMarkers.push(underLine)
        }

        const sectionLevel = this._sectionMarkers.indexOf(underLine) + 1
        return new SectionNode(textLine.idx, textLine.idx + 1, textLine, sectionLevel)
    }

    private parseParagraph(): ParagraphNode {
        const lines = new Array<Line>()
        const startLine = this._lineIdx
        let endLine = startLine

        while (this.canConsume() && (this.peek()?.len ?? 0) > 0) {
            const line = this.consume()
            lines.push(line)
            endLine += 1
        }

        // 0 (content)    Paragraph
        // 1 \n        <- lineIdx is here
        // 2 (content)
        return new ParagraphNode(startLine, endLine, lines)
    }
}
