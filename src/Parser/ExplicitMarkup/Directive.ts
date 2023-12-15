import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export class Directive extends RstNode {
    type = RstNodeType.Directive

    constructor(
        readonly directive: string,
        readonly data: string,

        source: RstNodeSource,
        children: Array<RstNode>,
    ) {
        super(source, children)
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1 && this.children[0].isPlainTextContent
    }

    override toShortString(): string {
        return `${super.toShortString()} directive:${this.directive} data:"${this.data}"`
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            directive: this.directive,
            data: this.data,
        }

        return root
    }
}
