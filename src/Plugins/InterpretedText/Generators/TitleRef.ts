import { createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'

export const titleRefInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'title-reference',
        'title',
        't',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<cite>${sanitizeHtml(node.textContent)}</cite>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`*${sanitizeHtml(node.textContent)}*`)
    },
)
