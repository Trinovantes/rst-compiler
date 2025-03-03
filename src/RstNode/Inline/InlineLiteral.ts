import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstText, RstTextData } from './Text.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { RstNodeJson } from '../RstNode.js'

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

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const inlineLiteralGenerators = createNodeGenerators(
    'InlineLiteral',

    (generatorState, node) => {
        generatorState.writeText(`<span class="${generatorState.opts.htmlClass.literalInline}">${sanitizeHtml(node.textContent)}</span>`)
    },

    (generatorState, node) => {
        generatorState.writeText(`\`${node.textContent}\``) // Don't sanitize since this is written inside literal text
    },
)
