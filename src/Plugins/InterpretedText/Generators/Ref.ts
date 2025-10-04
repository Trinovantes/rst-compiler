import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'
import { normalizeSimpleName } from '../../../SimpleName.ts'
import { parseEmbededRef } from '../../../utils/parseEmbededRef.ts'

export const refInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'ref',
    ],

    (generatorState, node) => {
        const { label, target } = parseEmbededRef(node.rawTextContent)
        const simpleName = normalizeSimpleName(target)
        const { externalUrl, externalLabel } = generatorState.resolveExternalRef(node, simpleName)
        generatorState.writeTextWithLinePrefix(`<a href="${externalUrl}">${sanitizeHtml(externalLabel ?? label)}</a>`)
    },

    (generatorState, node) => {
        const { label, target } = parseEmbededRef(node.rawTextContent)
        const simpleName = normalizeSimpleName(target)
        const { externalUrl, externalLabel } = generatorState.resolveExternalRef(node, simpleName)
        generatorState.writeTextWithLinePrefix(`[${sanitizeHtml(externalLabel ?? label)}](${externalUrl})`)
    },
)
