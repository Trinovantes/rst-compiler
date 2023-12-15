import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export class Citation extends RstNode {
    type = RstNodeType.Citation

    constructor(
        readonly label: string,

        source: RstNodeSource,
        children: Array<RstNode>,
    ) {
        super(source, children)
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1 && this.children[0].isPlainTextContent
    }

    override toShortString(): string {
        return `${super.toShortString()} label:"${this.label}"`
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            label: this.label,
        }

        return root
    }
}
