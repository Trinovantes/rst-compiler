import { RstNode, type RstNodeJson, type RstNodeSource } from '../RstNode.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#transitions
// ----------------------------------------------------------------------------

export class RstTransition extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
    ) {
        super(registrar, source)
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstTransition {
        return new RstTransition(registrar, structuredClone(json.source))
    }

    override clone(registrar: RstNodeRegistrar): RstTransition {
        return new RstTransition(registrar, structuredClone(this.source))
    }

    override get nodeType(): RstNodeType {
        return 'Transition'
    }
}
