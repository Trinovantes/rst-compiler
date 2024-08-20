import { isSimpleName } from '@/SimpleName.js'
import { RstNodeJson } from '../RstNode.js'
import { RstText, RstTextData } from './Text.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

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
        return RstNodeType.CitationRef
    }

    static isValidText(bodyText: string): boolean {
        return isSimpleName(bodyText)
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const citationRefGenerators = createNodeGenerators(
    RstNodeType.CitationRef,

    (generatorState, node) => {
        const refId = generatorState.htmlAttrResolver.getNodeHtmlId(node)
        const targetDef = generatorState.resolveCitationDef(node)
        const targetDefUrl = generatorState.resolveNodeToUrl(targetDef)
        generatorState.writeTextWithLinePrefix(`<a href="${targetDefUrl}" id="${refId}" class="${generatorState.opts.htmlClass.citationRef}">${sanitizeHtml(node.textContent)}</a>`)
    },

    (generatorState, node) => {
        const label = node.nthOfType
        generatorState.writeTextWithLinePrefix(`[^${label}]`)
    },
)
