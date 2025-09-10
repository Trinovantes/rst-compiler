import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.js'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.js'

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
