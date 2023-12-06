import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export const fieldListRe = /^[ ]*(:(.+): )([^\n]*)$/

export class FieldListNode extends RstNode {
    type = RstNodeType.FieldList
}

export class FieldListItemNode extends RstNode {
    type = RstNodeType.FieldListItem

    constructor(
        readonly fieldName: string,
        readonly fieldBodyNodes: Array<RstNode>,

        source: RstNodeSource,
    ) {
        super(source)
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        const start = this.source.startLineIdx + 1
        const end = this.source.endLineIdx + 1
        let str = selfTab + `[${this.label}] (${start}-${end})\n`

        str += selfTab + '  (Name)' + '\n'
        str += selfTab + `    ${this.fieldName}` + '\n'

        str += selfTab + '  (Body)' + '\n'
        for (const node of this.fieldBodyNodes) {
            str += node.toString(depth + 2)
        }

        return str
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            name: this.fieldName,
            body: this.fieldBodyNodes.map((node) => node.toObject()),
        }

        return root
    }
}
