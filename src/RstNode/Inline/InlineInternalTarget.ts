import { RstText, RstTextData } from './Text.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeJson } from '../RstNode.js'
import { RstNodeType } from '../RstNodeType.js'

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

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const inlineInternalTargetGenerators = createNodeGenerators(
    'InlineInternalTarget',

    (generatorState, node) => {
        const htmlId = generatorState.htmlAttrResolver.getNodeHtmlId(node)
        generatorState.writeTextWithLinePrefix(`<span class="${generatorState.opts.htmlClass.inlineInternalTarget}" id="${htmlId}">${sanitizeHtml(node.textContent)}</span>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(sanitizeHtml(node.textContent))
    },
)
