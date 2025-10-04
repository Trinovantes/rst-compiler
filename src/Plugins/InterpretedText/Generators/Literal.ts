import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

export const literalInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'literal',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<span class="${generatorState.opts.htmlClass.literalInline}">${sanitizeHtml(node.textContent)}</span>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`\`${node.textContent}\``) // Don't sanitize since this is written inside literal text
    },
)
