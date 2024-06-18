import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { RstNodeJson } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstText, RstTextData } from './Text.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstStrongEmphasis extends RstText {
    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTextData>): RstStrongEmphasis {
        return new RstStrongEmphasis(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstStrongEmphasis {
        return new RstStrongEmphasis(registrar, structuredClone(this.source), this.rawText)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.StrongEmphasis
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const strongEmphasisGenerators = createNodeGenerators(
    RstNodeType.StrongEmphasis,

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<strong>${sanitizeHtml(node.textContent)}</strong>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`**${sanitizeHtml(node.textContent)}**`)
    },
)
