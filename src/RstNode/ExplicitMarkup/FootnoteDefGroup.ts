import { RstNode, type RstNodeJson } from '../RstNode.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstFootnoteDefGroup extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstFootnoteDefGroup {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstFootnoteDefGroup(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstFootnoteDefGroup {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstFootnoteDefGroup(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'FootnoteDefGroup'
    }
}
