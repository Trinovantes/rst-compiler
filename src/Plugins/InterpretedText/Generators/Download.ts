import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { parseEmbededRef } from '../../../utils/parseEmbededRef.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

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
