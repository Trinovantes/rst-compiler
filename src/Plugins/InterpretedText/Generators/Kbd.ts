import { createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'

export const kbdInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'kbd',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<kbd>${sanitizeHtml(node.textContent)}</kbd>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`\`${node.textContent}\``) // Don't sanitize since this is written inside literal text
    },
)
