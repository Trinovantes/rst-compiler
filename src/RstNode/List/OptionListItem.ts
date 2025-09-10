import { RstNode, type RstNodeJson, type RstNodeObject, type RstNodeSource } from '../RstNode.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type CommandOption = {
    name: string
    delimiter?: string
    rawArgName?: string
}

export type OptionListItemData = {
    options: ReadonlyArray<CommandOption>
}

export class RstOptionListItem extends RstNode {
    readonly options: ReadonlyArray<CommandOption>

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        options: ReadonlyArray<CommandOption>,
    ) {
        super(registrar, source, children)
        this.options = options
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            options: this.options,
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<OptionListItemData>

        root.data = {
            options: this.options,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<OptionListItemData>): RstOptionListItem {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstOptionListItem(registrar, structuredClone(json.source), children, structuredClone(json.data.options))
    }

    override clone(registrar: RstNodeRegistrar): RstOptionListItem {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstOptionListItem(registrar, structuredClone(this.source), children, structuredClone(this.options))
    }

    override get nodeType(): RstNodeType {
        return 'OptionListItem'
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        let str = selfTab + `[${this.toShortString()}] (${this.lineNums})\n`

        str += selfTab + `  (Options len:${this.options.length})` + '\n'
        for (const option of this.options) {
            str += selfTab + `    name:"${option.name}" delimiter:"${option.delimiter}" rawArgName:"${option.rawArgName}"` + '\n'
        }

        str += selfTab + '  (Description)' + '\n'
        for (const node of this.children) {
            str += node.toString(depth + 2)
        }

        return str
    }
}
