import { isSimpleName } from '../../SimpleName.ts'
import type { RstNodeJson } from '../RstNode.ts'
import { RstText, type RstTextData } from './Text.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstCitationRef extends RstText {
    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTextData>): RstCitationRef {
        return new RstCitationRef(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstCitationRef {
        return new RstCitationRef(registrar, structuredClone(this.source), this.rawText)
    }

    override get nodeType(): RstNodeType {
        return 'CitationRef'
    }

    static isValidText(bodyText: string): boolean {
        return isSimpleName(bodyText)
    }
}
