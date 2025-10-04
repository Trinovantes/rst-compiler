import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { parseEmbededRef } from '../../../utils/parseEmbededRef.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

export const docInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'doc',
    ],

    (generatorState, node) => {
        const { label, target } = parseEmbededRef(node.rawTextContent)
        const { externalUrl, externalLabel } = generatorState.resolveExternalDoc(node, target)
        const displayLabel = (label === target)
            ? externalLabel ?? label
            : label

        generatorState.writeTextWithLinePrefix(`<a href="${externalUrl}">${sanitizeHtml(displayLabel)}</a>`)
    },

    (generatorState, node) => {
        const { label, target } = parseEmbededRef(node.rawTextContent)
        const { externalUrl, externalLabel } = generatorState.resolveExternalDoc(node, target)
        const displayLabel = (label === target)
            ? externalLabel ?? label
            : label

        generatorState.writeTextWithLinePrefix(`[${sanitizeHtml(displayLabel)}](${externalUrl})`)
    },
)
