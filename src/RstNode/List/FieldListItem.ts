import { ContinuousText } from '../Inline/Text.js'
import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { normalizeSimpleName } from '@/SimpleName.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstFieldListItemData = {
    name: Array<RstNodeJson>
    body: Array<RstNodeJson>
}

export class RstFieldListItem extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        readonly name: ContinuousText,
        readonly body: ReadonlyArray<RstNode>,
    ) {
        super(registrar, source)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            name: this.name.map((node) => node.toObject()),
            body: this.body.map((node) => node.toObject()),
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstFieldListItemData>

        root.data = {
            name: this.name.map((node) => node.toJSON()),
            body: this.body.map((node) => node.toJSON()),
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstFieldListItemData>): RstFieldListItem {
        const name = json.data.name.map((childJson) => registrar.reviveRstTextFromJson(childJson))
        const body = json.data.body.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstFieldListItem(registrar, structuredClone(json.source), name, body)
    }

    override clone(registrar: RstNodeRegistrar): RstFieldListItem {
        const name = this.name.map((child) => child.clone(registrar))
        const body = this.body.map((child) => child.clone(registrar))
        return new RstFieldListItem(registrar, structuredClone(this.source), name, body)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.FieldListItem
    }

    get nameText(): string {
        return this.name.map((textNode) => textNode.textContent).join('')
    }

    get bodyText(): string {
        return this.body.map((bodyNode) => bodyNode.textContent).join('')
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        let str = selfTab + `[${this.toShortString()}] (${this.lineNums})\n`

        str += selfTab + '  (Name)' + '\n'
        for (const node of this.name) {
            str += node.toString(depth + 2)
        }

        str += selfTab + '  (Body)' + '\n'
        for (const node of this.body) {
            str += node.toString(depth + 2)
        }

        return str
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const fieldListItemGenerators = createNodeGenerators(
    RstNodeType.FieldListItem,

    (generatorState, node) => {
        const className = normalizeSimpleName(node.name.map((nameNode) => nameNode.textContent).join(''))
        const attr = new HtmlAttributeStore({ class: className })

        generatorState.writeLineHtmlTagWithAttr('dt', node, attr, () => {
            generatorState.writeLineVisitor(() => {
                generatorState.visitNodes(node.name)
            })
        })

        generatorState.writeLineHtmlTagWithAttr('dd', node, attr, () => {
            generatorState.visitNodes(node.body)
        })
    },

    (generatorState, node) => {
        // First line contains term
        generatorState.writeLineVisitor(() => {
            generatorState.writeText('**')

            for (const textNode of node.name) {
                generatorState.visitNode(textNode)
            }

            generatorState.writeText('**')
        })

        // Empty line between term and definition
        generatorState.writeLine()

        // Subsequent lines contain definitions
        generatorState.visitNodes(node.body)
    },
)
