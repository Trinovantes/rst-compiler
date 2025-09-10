import { createNodeGenerators } from '../RstGenerator.js'

export const footnoteRefGenerators = createNodeGenerators(
    'FootnoteRef',

    (generatorState, node) => {
        const targetDef = generatorState.resolveFootnoteDef(node)
        const targetDefUrl = generatorState.resolveNodeToUrl(targetDef)
        const refId = generatorState.htmlAttrResolver.getNodeHtmlId(node)
        const refLabel = generatorState.resolveFootnoteRefLabel(node)
        generatorState.writeTextWithLinePrefix(`<a href="${targetDefUrl}" id="${refId}" class="${generatorState.opts.htmlClass.footnoteRef}">${refLabel}</a>`)
    },

    (generatorState, node) => {
        const refLabel = generatorState.resolveFootnoteRefLabel(node)
        generatorState.writeTextWithLinePrefix(`[^${refLabel}]`)
    },
)
