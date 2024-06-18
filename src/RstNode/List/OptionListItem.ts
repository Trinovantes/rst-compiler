import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

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
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        readonly options: ReadonlyArray<CommandOption>,
    ) {
        super(registrar, source, children)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            options: this.options,
        }

        return root
    }

    override toJson(): RstNodeJson {
        const root = super.toJson() as RstNodeJson<OptionListItemData>

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
        return RstNodeType.OptionListItem
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

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const optionListItemGenerators = createNodeGenerators(
    RstNodeType.OptionListItem,

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('dt', node, () => {
            generatorState.writeLineVisitor(() => {
                generatorState.writeText('<kbd>')

                for (const [idx, option] of node.options.entries()) {
                    if (idx > 0) {
                        generatorState.writeText(', ')
                    }

                    generatorState.writeText(`<span class="${generatorState.opts.htmlClass.optionListItemOption}">`)

                    generatorState.writeText(sanitizeHtml(option.name))
                    if (option.rawArgName && option.delimiter) {
                        generatorState.writeText(option.delimiter)
                        generatorState.writeText(`<var>${sanitizeHtml(option.rawArgName)}</var>`)
                    }

                    generatorState.writeText('</span>')
                }

                generatorState.writeText('</kbd>')
            })
        })

        generatorState.writeLineHtmlTag('dd', node, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        // First line contains option
        generatorState.writeLineVisitor(() => {
            generatorState.writeText('`')

            for (const [idx, option] of node.options.entries()) {
                if (idx > 0) {
                    generatorState.writeText(', ')
                }

                generatorState.writeText(option.name)
                if (option.rawArgName && option.delimiter) {
                    generatorState.writeText(option.delimiter)
                    generatorState.writeText(option.rawArgName) // Don't sanitize since this is written inside literal text
                }
            }

            generatorState.writeText('`')
        })

        // Empty line between option and description
        generatorState.writeLine()

        // Subsequent lines contain description
        generatorState.visitNodes(node.children)
    },
)
