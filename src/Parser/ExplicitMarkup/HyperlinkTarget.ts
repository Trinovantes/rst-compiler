import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export class HyperlinkTarget extends RstNode {
    type = RstNodeType.HyperLinkTarget

    constructor(
        readonly label: string,
        readonly link: string,

        source: RstNodeSource,
    ) {
        super(source)
    }

    override toShortString(): string {
        return `${super.toShortString()} label:"${this.label}" link:"${this.link}"`
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {}

        if (this.isInternal) {
            root.meta.isInternal = true
        } else {
            root.meta.link = this.link
        }

        if (this.isAnonymous) {
            root.meta.isAnonymous = true
        } else {
            root.meta.label = this.label
        }

        return root
    }

    get isInternal(): boolean {
        return this.link.length === 0
    }

    get isAnonymous(): boolean {
        return this.label === '_'
    }
}
