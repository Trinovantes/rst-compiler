import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { parseEmbededRef } from '../../../utils/parseEmbededRef.ts'
import { normalizeSimpleName } from '../../../SimpleName.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

export const jsRoles = new Set([
    'js:mod',
    'js:func',
    'js:meth',
    'js:class',
    'js:data',
    'js:attr',
])

export const jsInterpretedTextGenerators = createInterpretedTextGenerators(
    [...jsRoles],

    (generatorState, node) => {
        const { label, target } = parseEmbededRef(node.rawTextContent)
        const simpleName = normalizeSimpleName(`js-${target}`)
        const externalRef = generatorState.resolveExternalRef(node, simpleName)
        generatorState.writeTextWithLinePrefix(`<a href="${externalRef.externalUrl}">${sanitizeHtml(externalRef.externalLabel ?? label)}</a>`)
    },

    (generatorState, node) => {
        const { label, target } = parseEmbededRef(node.rawTextContent)
        const simpleName = normalizeSimpleName(`js-${target}`)
        const externalRef = generatorState.resolveExternalRef(node, simpleName)
        generatorState.writeTextWithLinePrefix(`[${sanitizeHtml(externalRef.externalLabel ?? label)}](${externalRef.externalUrl})`)
    },
)
