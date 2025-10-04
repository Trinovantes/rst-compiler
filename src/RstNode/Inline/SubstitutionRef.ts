import type { RstNodeJson } from '../RstNode.ts'
import { RstText, type RstTextData } from './Text.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstSubstitutionRef extends RstText {
    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTextData>): RstSubstitutionRef {
        return new RstSubstitutionRef(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstSubstitutionRef {
        return new RstSubstitutionRef(registrar, structuredClone(this.source), this.rawText)
    }

    override get nodeType(): RstNodeType {
        return 'SubstitutionRef'
    }
}
