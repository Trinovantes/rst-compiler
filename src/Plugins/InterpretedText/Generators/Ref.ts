import { createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { normalizeSimpleName } from '@/SimpleName.js'
import { parseEmbededRef } from '@/utils/parseEmbededRef.js'

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
