import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

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
