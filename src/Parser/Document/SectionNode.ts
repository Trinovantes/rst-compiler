import { escapeForRegExp } from '@/utils/escapeForRegExp.js'
import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'
import { TextNode } from '../Inline/TextNode.js'

export const sectionChars = ['=', '-', '`', ':', '.', "'", '"', '~', '^', '_', '*', '+', '#']
export const sectionRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).join('|')}){3,}[ ]*$`)

export class SectionNode extends RstNode {
    type = RstNodeType.Section

    constructor(
        readonly level: number,
        readonly origText: string,
        source: RstNodeSource,
    ) {
        // TODO parse inline elements
        const textNode = new TextNode(origText, source)
        super(source, [textNode])
    }

    override get label(): string {
        return `${this.type}:h${this.level}`
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            level: this.level,
        }

        return root
    }
}
