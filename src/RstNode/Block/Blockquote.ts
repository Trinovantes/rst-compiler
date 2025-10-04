import { RstNode, type RstNodeJson } from '../RstNode.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
// ----------------------------------------------------------------------------

export class RstBlockquote extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstBlockquote {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstBlockquote(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstBlockquote {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstBlockquote(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'Blockquote'
    }
}
