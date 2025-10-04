import { createNodeGenerators } from '../RstGenerator.ts'

export const substitutionDefGenerators = createNodeGenerators(
    'SubstitutionDef',

    (generatorState, node) => {
        const replacementText = generatorState.getChildrenText(() => {
            generatorState.writeLine(node.toShortString())
            generatorState.useNoCommentMarkup(() => {
                generatorState.useNoLineBreaksBetweenBlocks(() => {
                    generatorState.visitNodes(node.children)
                })
            })
        })

        generatorState.writeLineHtmlComment(replacementText)
    },

    (generatorState, node) => {
        const replacementText = generatorState.getChildrenText(() => {
            generatorState.writeLine(node.toShortString())
            generatorState.useNoCommentMarkup(() => {
                generatorState.useNoLineBreaksBetweenBlocks(() => {
                    generatorState.visitNodes(node.children)
                })
            })
        })

        generatorState.writeLineMdComment(replacementText)
    },
)
