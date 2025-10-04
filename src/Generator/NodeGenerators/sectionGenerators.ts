import { createNodeGenerators } from '../RstGenerator.ts'

export const sectionGenerators = createNodeGenerators(
    'Section',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag(`h${node.level}`, node, () => {
            generatorState.writeLineVisitor(() => {
                generatorState.visitNodes(node.children)
            })
        })
    },

    (generatorState, node) => {
        const htmlId = generatorState.htmlAttrResolver.getNodeHtmlId(node)

        generatorState.writeLineVisitor(() => {
            generatorState.writeText('#'.repeat(node.level))
            generatorState.writeText(' ')
            generatorState.visitNodes(node.children)
            generatorState.writeText(` {#${htmlId}}`)
        })
    },
)
