import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

export const strongInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'strong',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<strong>${sanitizeHtml(node.textContent)}</strong>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`**${sanitizeHtml(node.textContent)}**`)
    },
)
