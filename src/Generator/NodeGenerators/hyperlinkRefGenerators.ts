import { sanitizeHtml } from '../../utils/sanitizeHtml.js'
import { createNodeGenerators } from '../RstGenerator.js'

export const hyperlinkRefGenerators = createNodeGenerators(
    'HyperlinkRef',

    (generatorState, node) => {
        const url = generatorState.resolveHyperlinkRefToUrl(node)
        generatorState.writeTextWithLinePrefix(`<a href="${url}">${sanitizeHtml(node.label)}</a>`)
    },

    (generatorState, node) => {
        const url = generatorState.resolveHyperlinkRefToUrl(node)
        generatorState.writeTextWithLinePrefix(`[${sanitizeHtml(node.label)}](${url})`)
    },
)
