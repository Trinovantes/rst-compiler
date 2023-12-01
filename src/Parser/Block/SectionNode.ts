import { escapeForRegExp } from '@/utils/escapeForRegExp.js'
import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'
import { TextNode } from '../Inline/TextNode.js'

export const sectionChars = ['=', '-', '`', ':', '.', "'", '"', '~', '^', '_', '*', '+', '#']
export const sectionRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).join('|')}){3,}[ ]*$`)

export class SectionNode extends RstNode {
    type = RstNodeType.Section

    constructor(
        readonly sectionLevel: number,

        source: RstNodeSource,
        text: string,
    ) {
        // TODO parse inline elements
        const textNode = new TextNode(source.startLineIdx, source.endLineIdx, source.startIdx, text)
        super(source, [textNode])
    }

    override get label(): string {
        return `${this.type}:h${this.sectionLevel}`
    }
}
