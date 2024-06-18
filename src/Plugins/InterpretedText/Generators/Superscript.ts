import { createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'

export const superscriptInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'superscript',
        'sup',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<sup>${sanitizeHtml(node.textContent)}</sup>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`^${sanitizeHtml(node.textContent)}^`)
    },
)
