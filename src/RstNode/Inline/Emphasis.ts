import type { RstNodeJson } from '../RstNode.ts'
import { RstText, type RstTextData } from './Text.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstEmphasis extends RstText {
    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTextData>): RstEmphasis {
        return new RstEmphasis(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstEmphasis {
        return new RstEmphasis(registrar, structuredClone(this.source), this.rawText)
    }

    override get nodeType(): RstNodeType {
        return 'Emphasis'
    }
}
