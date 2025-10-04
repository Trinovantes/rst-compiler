import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

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
