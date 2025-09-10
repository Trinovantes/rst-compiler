import { sanitizeHtml } from '../../utils/sanitizeHtml.js'
import { createNodeGenerators } from '../RstGenerator.js'

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
