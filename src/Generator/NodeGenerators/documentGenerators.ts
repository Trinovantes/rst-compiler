import { createNodeGenerators } from '../RstGenerator.ts'

export const documentGenerators = createNodeGenerators(
    'Document',

    (generatorState, node) => {
        if (node.docMeta) {
            generatorState.writeLineHtmlComment(node.docMeta.toMapString())
            generatorState.writeLine()
        }

        generatorState.visitNodes(node.children)
    },

    (generatorState, node) => {
        if (node.docMeta) {
            generatorState.writeLineMdComment(node.docMeta.toMapString())
            generatorState.writeLine()
        }

        generatorState.visitNodes(node.children)
    },
)
