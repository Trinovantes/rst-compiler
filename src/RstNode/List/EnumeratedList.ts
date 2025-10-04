import { RstNode, type RstNodeJson, type RstNodeObject, type RstNodeSource } from '../RstNode.ts'
import type { RstEnumeratedListType } from './EnumeratedListType.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
// ----------------------------------------------------------------------------

export type RstEnumeratedListData = {
    listType: RstEnumeratedListType
}

export class RstEnumeratedList extends RstNode {
    readonly listType: RstEnumeratedListType

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        listType: RstEnumeratedListType,
    ) {
        super(registrar, source, children)
        this.listType = listType
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            listType: this.listType,
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstEnumeratedListData>

        root.data = {
            listType: this.listType,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstEnumeratedListData>): RstEnumeratedList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstEnumeratedList(registrar, structuredClone(json.source), children, json.data.listType)
    }

    override clone(registrar: RstNodeRegistrar): RstEnumeratedList {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstEnumeratedList(registrar, structuredClone(this.source), children, this.listType)
    }

    override get nodeType(): RstNodeType {
        return 'EnumeratedList'
    }

    override toShortString(): string {
        return `${super.toShortString()} "${this.listType}"`
    }
}
