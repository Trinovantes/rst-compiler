import { createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'

export const emphasisInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'emphasis',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<em>${sanitizeHtml(node.textContent)}</em>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`*${sanitizeHtml(node.textContent)}*`)
    },
)
