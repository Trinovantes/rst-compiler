import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export const optionArgRe = /[a-zA-Z][a-zA-Z0-9_-]*|<.+>/

// Does not support DOS/VMS options
export const optionRe = new RegExp(
    '(' +
        `-([a-zA-Z0-9])([ ])(${optionArgRe.source})?` + // Short form (delimiter must be space)
    '|' +
        `--([a-zA-Z-]+)([ |=])(${optionArgRe.source})?` + // Long form (delimiter can either be equals or space)
    ')',
)

export const optionListRe = /^[ ]*-{1,2}[^ -][^\n]+$/

export class OptionListNode extends RstNode {
    type = RstNodeType.OptionList
}

export type OptionListItemNodeOption = {
    name: string
    delimiter: string
    argName?: string
}

export class OptionListItemNode extends RstNode {
    type = RstNodeType.OptionListItem

    constructor(
        readonly options: Array<OptionListItemNodeOption>,
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
