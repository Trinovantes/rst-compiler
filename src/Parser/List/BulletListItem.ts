import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export class BulletListItem extends RstNode {
    type = RstNodeType.BulletListItem

    constructor(
        readonly bullet: string,

        source: RstNodeSource,
        children: ReadonlyArray<Readonly<RstNode>> = [],
    ) {
        super(source, children)
    }

    override get label(): string {
        return `${this.type} "${this.bullet}"`
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1 && this.children[0].isPlainTextContent
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            bullet: this.bullet,
        }

        return root
    }
}
