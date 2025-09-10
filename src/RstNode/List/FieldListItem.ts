import type { ContinuousText } from '../Inline/Text.js'
import { RstNode, type RstNodeJson, type RstNodeObject, type RstNodeSource } from '../RstNode.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstFieldListItemData = {
    name: Array<RstNodeJson>
    body: Array<RstNodeJson>
}

export class RstFieldListItem extends RstNode {
    readonly name: ContinuousText
    readonly body: ReadonlyArray<RstNode>

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        name: ContinuousText,
        body: ReadonlyArray<RstNode>,
    ) {
        super(registrar, source, body)
        this.name = name
        this.body = body
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
        return 'FieldListItem'
    }

    override get shouldTestTextContent() {
        return false
    }

    override get shouldTestChildren() {
        return false
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
