import { RstText, type RstTextData } from './Text.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'
import type { RstNodeJson } from '../RstNode.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstInlineLiteral extends RstText {
    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTextData>): RstInlineLiteral {
        return new RstInlineLiteral(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstInlineLiteral {
        return new RstInlineLiteral(registrar, structuredClone(this.source), this.rawText)
    }

    override get nodeType(): RstNodeType {
        return 'InlineLiteral'
    }

    override get textContent(): string {
        // Do not escape InlineLiteral since by definition it should be raw text
        return this.rawText
    }

    override get rawTextContent(): string {
        return this.rawText
    }
}
