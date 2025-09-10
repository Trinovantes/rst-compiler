import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.js'
import { parseEmbededRef } from '../../../utils/parseEmbededRef.js'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.js'

export const downloadInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'download',
    ],

    (generatorState, node) => {
        const { label, target } = parseEmbededRef(node.rawTextContent)
        const { downloadDest, fileName } = generatorState.registerDownload(target)
        generatorState.writeTextWithLinePrefix(`<a href="${downloadDest}" download="${fileName}">${sanitizeHtml(label)}</a>`)
    },
)
