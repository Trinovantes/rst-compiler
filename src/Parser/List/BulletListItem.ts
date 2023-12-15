import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export class BulletListItem extends RstNode {
    type = RstNodeType.BulletListItem

    constructor(
        readonly bullet: string,

        source: RstNodeSource,
        children: Array<RstNode> = [],
    ) {
        super(source, children)
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1 && this.children[0].isPlainTextContent
    }

    override toShortString(): string {
        return `${super.toShortString()} "${this.bullet}"`
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            bullet: this.bullet,
        }

        return root
    }
}
