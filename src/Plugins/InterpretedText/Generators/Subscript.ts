import { createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'

export const subscriptInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'subscript',
        'sub',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<sub>${sanitizeHtml(node.textContent)}</sub>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`~${sanitizeHtml(node.textContent)}~`)
    },
)
