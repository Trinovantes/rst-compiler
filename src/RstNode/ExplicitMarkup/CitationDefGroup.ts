import { RstNode, type RstNodeJson } from '../RstNode.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstCitationDefGroup extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstCitationDefGroup {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstCitationDefGroup(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstCitationDefGroup {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstCitationDefGroup(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'CitationDefGroup'
    }
}
