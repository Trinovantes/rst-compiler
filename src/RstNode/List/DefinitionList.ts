import { RstNode, type RstNodeJson } from '../RstNode.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#definition-lists
// ----------------------------------------------------------------------------

export class RstDefinitionList extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstDefinitionList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstDefinitionList(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstDefinitionList {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstDefinitionList(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'DefinitionList'
    }
}
