import { escapeForRegExp } from '@/utils/escapeForRegExp.js'
import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'
import { TextNode } from '../Inline/TextNode.js'
import { Token } from '@/index.js'

export const sectionChars = ['=', '-', '`', ':', '.', "'", '"', '~', '^', '_', '*', '+', '#']
export const sectionRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).join('|')}){3,}[ ]*$`)

export class SectionNode extends RstNode {
    type = RstNodeType.Section

    constructor(
        source: RstNodeSource,

        textStartLineIdx: number,
        textLine: Token,

        readonly sectionLevel: number,
    ) {
        // TODO parse inline elements
        const textNode = new TextNode(textStartLineIdx, textStartLineIdx + 1, textLine.idx, textLine.str)
        super(source, [textNode])
    }

    override get label(): string {
        return `${this.type}:h${this.sectionLevel}`
    }
}
