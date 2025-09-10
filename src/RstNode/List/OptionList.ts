import { RstNode, type RstNodeJson } from '../RstNode.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#option-lists
// ----------------------------------------------------------------------------

export class RstOptionList extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstOptionList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstOptionList(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstOptionList {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstOptionList(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'OptionList'
    }
}
