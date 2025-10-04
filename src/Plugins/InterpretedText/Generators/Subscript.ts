import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

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
