import { RstText, type RstTextData } from './Text.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeJson } from '../RstNode.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstInlineInternalTarget extends RstText {
    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTextData>): RstInlineInternalTarget {
        return new RstInlineInternalTarget(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstInlineInternalTarget {
        return new RstInlineInternalTarget(registrar, structuredClone(this.source), this.rawText)
    }

    override get nodeType(): RstNodeType {
        return 'InlineInternalTarget'
    }
}
