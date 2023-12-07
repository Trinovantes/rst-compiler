import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export type OptionListItemOption = {
    name: string
    delimiter: string
    argName?: string
}

export class OptionListItem extends RstNode {
    type = RstNodeType.OptionListItem

    constructor(
        readonly options: Array<OptionListItemOption>,
        readonly desc: Array<RstNode>,

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

        str += selfTab + `  (Options len:${this.options.length})` + '\n'
        for (const option of this.options) {
            str += selfTab + `    name:"${option.name}" delimiter:"${option.delimiter}" argName:"${option.argName}"` + '\n'
        }

        str += selfTab + '  (Description)' + '\n'
        for (const node of this.desc) {
            str += node.toString(depth + 2)
        }

        return str
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            options: this.options,
            desc: this.desc.map((node) => node.toObject()),
        }

        return root
    }
}
