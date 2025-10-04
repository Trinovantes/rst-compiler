import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

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
