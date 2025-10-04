import { sanitizeHtml } from '../../utils/sanitizeHtml.ts'
import { createNodeGenerators } from '../RstGenerator.ts'

export const commentGenerators = createNodeGenerators(
    'Comment',

    (generatorState, node) => {
        generatorState.writeLineHtmlComment(sanitizeHtml(node.textContent))
    },

    (generatorState, node) => {
        generatorState.writeLineMdComment(sanitizeHtml(node.textContent))
    },
)
