import { RstNode, type RstNodeJson } from '../RstNode.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
// ----------------------------------------------------------------------------

export class RstBulletList extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstBulletList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstBulletList(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstBulletList {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstBulletList(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'BulletList'
    }
}
