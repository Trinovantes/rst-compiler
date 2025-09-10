import { createNodeGenerators } from '../RstGenerator.js'

// ----------------------------------------------------------------------------
// MARK: DefinitionList
// ----------------------------------------------------------------------------

export const definitionListGenerators = createNodeGenerators(
    'DefinitionList',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('dl', node, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)

// ----------------------------------------------------------------------------
// MARK: DefinitionListItem
// ----------------------------------------------------------------------------

export const definitionListItemGenerators = createNodeGenerators(
    'DefinitionListItem',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('dt', node, () => {
            generatorState.writeLineVisitor(() => {
                for (const textNode of node.term) {
                    generatorState.visitNode(textNode)
                }

                for (const classifier of node.classifiers) {
                    generatorState.writeText(' ')
                    generatorState.writeText(`<span class="${generatorState.opts.htmlClass.definitionListItemClassifier}">`)

                    for (const textNode of classifier) {
                        generatorState.visitNode(textNode)
                    }

                    generatorState.writeText('</span>')
                }
            })
        })

        generatorState.writeLineHtmlTag('dd', node, () => {
            generatorState.visitNodes(node.definition)
        })
    },

    (generatorState, node) => {
        // First line contains term
        generatorState.writeLineVisitor(() => {
            generatorState.writeText('**')

            for (const textNode of node.term) {
                generatorState.visitNode(textNode)
            }

            for (const classifier of node.classifiers) {
                generatorState.writeText(' ')
                generatorState.writeText('*')

                for (const textNode of classifier) {
                    generatorState.visitNode(textNode)
                }

                generatorState.writeText('*')
            }

            generatorState.writeText('**')
        })

        // Empty line between term and definition
        generatorState.writeLine()

        // Subsequent lines contain definitions
        generatorState.visitNodes(node.definition)
    },
)
