import { createNodeGenerators } from '../RstGenerator.ts'

export const hyperlinkTargetGenerators = createNodeGenerators(
    'HyperlinkTarget',

    (generatorState, node) => {
        const resolvedUrl = generatorState.resolveNodeToUrl(node)
        generatorState.writeLineHtmlComment(`${node.toShortString()} resolvedUrl:"${resolvedUrl}"`)
    },

    (generatorState, node) => {
        const resolvedUrl = generatorState.resolveNodeToUrl(node)
        generatorState.writeLineMdComment(`${node.toShortString()} resolvedUrl:"${resolvedUrl}"`)
    },
)
