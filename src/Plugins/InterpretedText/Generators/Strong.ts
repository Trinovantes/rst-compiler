import { createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'

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
