import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

export class ListItemNode extends RstNode {
    type = RstNodeType.ListItem

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

    override toExpectString(selfVarName: string): string {
        let str = ''

        str += `expect((${selfVarName} as ListItemNode).bullet).toBe('${this.bullet}')`
        str += '\n' + super.toExpectString(selfVarName)

        return str
    }
}
