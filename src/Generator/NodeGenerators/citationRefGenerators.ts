import { sanitizeHtml } from '../../utils/sanitizeHtml.ts'
import { createNodeGenerators } from '../RstGenerator.ts'

export const citationRefGenerators = createNodeGenerators(
    'CitationRef',

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
