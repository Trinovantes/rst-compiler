import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export class SubstitutionDef extends RstNode {
    type = RstNodeType.SubstitutionDef

    constructor(
        readonly directive: string,
        readonly needle: string,
        readonly data: string,

        source: RstNodeSource,
        children: Array<RstNode>,
    ) {
        super(source, children)
    }

    override toShortString(): string {
        return `${super.toShortString()} directive:${this.directive} needle:"${this.needle}" data:"${this.data}"`
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            directive: this.directive,
            needle: this.needle,
            data: this.data,
        }

        return root
    }
}
