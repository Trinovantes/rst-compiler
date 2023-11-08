import { Line } from '@/Lexer/Line.js'
import { RstNode, RstNodeType } from '../RstNode.js'

export class TextNode extends RstNode {
    type = RstNodeType.Text

    constructor(
        startLine: number,
        endLine: number,
        private readonly _lines: Array<Line>,
    ) {
        const startIdx = _lines[0].idx
        const endIdx = _lines.reduce((sum, line) => sum + line.len, startIdx)
        super(startIdx, endIdx, startLine, endLine)
    }

    override toString(depth = 0): string {
        const childTab = '  '.repeat(depth + 1)
        let str = super.toString(depth)

        for (const line of this._lines) {
            str += childTab + `"${line.str}"\n`
        }

        return str
    }
}
