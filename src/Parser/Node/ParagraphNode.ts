import { Line } from '@/Lexer/Line.js'
import { RstNode, RstNodeType } from '../RstNode.js'
import { TextNode } from './TextNode.js'

export class ParagraphNode extends RstNode {
    type = RstNodeType.Paragraph

    constructor(
        startLine: number,
        endLine: number,
        lines: Array<Line>,
    ) {
        const startIdx = lines[0].idx
        const endIdx = lines.reduce((sum, line) => sum + line.len, startIdx)
        super(startIdx, endIdx, startLine, endLine)

        const text = new TextNode(startLine, endLine, lines)
        this._children.push(text)
    }
}
