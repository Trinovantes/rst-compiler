import { sanitizeHtml } from '../../utils/sanitizeHtml.js'
import { createNodeGenerators } from '../RstGenerator.js'

export const commentGenerators = createNodeGenerators(
    'Comment',

    (generatorState, node) => {
        generatorState.writeLineHtmlComment(sanitizeHtml(node.textContent))
    },

    (generatorState, node) => {
        generatorState.writeLineMdComment(sanitizeHtml(node.textContent))
    },
)
