import { escapeForRegExp } from '@/utils/escapeForRegExp.js'
import { RstNode, RstNodeType } from '../RstNode.js'
import { Line } from '@/Lexer/Line.js'
import { TextNode } from './TextNode.js'

export const sectionChars = ['=', '-', '`', ':', '.', "'", '"', '~', '^', '_', '*', '+', '#']
export const sectionRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).join('|')}){3,}\\s*$`)

export class SectionNode extends RstNode {
    type = RstNodeType.Section

    constructor(
        startLine: number,
        endLine: number,
        line: Line,
        readonly sectionLevel: number,
    ) {
        const startIdx = line.idx
        const endIdx = line.idx + line.len
        super(startIdx, endIdx, startLine, endLine)

        const text = new TextNode(startLine, endLine, [line])
        this._children.push(text)
    }

    override get label(): string {
        return `${this.type}:h${this.sectionLevel}`
    }
}
