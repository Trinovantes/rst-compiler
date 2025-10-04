import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

export const acronymInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'acronym',
        'ac',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<abbr>${sanitizeHtml(node.textContent)}</abbr>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`*${sanitizeHtml(node.textContent)}*`)
    },
)
