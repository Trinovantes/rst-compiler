import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

export class ListItemNode extends RstNode {
    type = RstNodeType.ListItem

    constructor(
        source: RstNodeSource,
        readonly bullet: string,
        children: ReadonlyArray<Readonly<RstNode>> = [],
    ) {
        super(source, children)
    }

    override get label(): string {
        return `${this.type} "${this.bullet}"`
    }

    override toExpectString(selfVarName = 'root'): string {
        let str = super.toExpectString(selfVarName)

        str += `expect((${selfVarName} as ListItemNode).bullet).toBe('${this.bullet}')`

        return str
    }
}
