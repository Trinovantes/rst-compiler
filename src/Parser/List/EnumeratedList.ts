import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'
import { EnumeratedListType } from './EnumeratedListType.js'

export class EnumeratedList extends RstNode {
    type = RstNodeType.EnumeratedList

    constructor(
        readonly listType: EnumeratedListType,

        source: RstNodeSource,
        children: Array<RstNode> = [],
    ) {
        super(source, children)
    }

    override get label(): string {
        return `${this.type} "${this.listType}"`
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            listType: this.listType,
        }

        return root
    }
}
