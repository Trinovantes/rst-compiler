import { TextNode } from '../Inline/TextNode.js'
import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

export const fieldListRe = /^[ ]*(:(.+): )([^\n]*)$/

export class FieldListNode extends RstNode {
    type = RstNodeType.FieldList
}

export class FieldListItemNode extends RstNode {
    type = RstNodeType.FieldListItem

    constructor(
        readonly fieldName: TextNode,
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
        let str = selfTab + `[${this.label}] startIdx:${this.source.startIdx} endIdx:${this.source.endIdx} (${this.length}) line:${start}-${end}\n`

        str += selfTab + '  (Name)' + '\n'
        str += this.fieldName.toString(depth + 2)

        str += selfTab + '  (Body)' + '\n'
        for (const defBody of this.fieldBodyNodes) {
            str += defBody.toString(depth + 2)
        }

        return str
    }
}
