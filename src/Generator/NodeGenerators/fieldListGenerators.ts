import { HtmlAttributeStore } from '../HtmlAttributeStore.js'
import { createNodeGenerators } from '../RstGenerator.js'
import { normalizeSimpleName } from '../../SimpleName.js'

// ----------------------------------------------------------------------------
// MARK: FieldList
// ----------------------------------------------------------------------------

export const fieldListGenerators = createNodeGenerators(
    'FieldList',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('dl', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.fieldList }), () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)

// ----------------------------------------------------------------------------
// MARK: FieldListItem
// ----------------------------------------------------------------------------

export const fieldListItemGenerators = createNodeGenerators(
    'FieldListItem',

    (generatorState, node) => {
        const className = normalizeSimpleName(node.name.map((nameNode) => nameNode.textContent).join(''))
        const attr = new HtmlAttributeStore({ class: className })

        generatorState.writeLineHtmlTagWithAttr('dt', node, attr, () => {
            generatorState.writeLineVisitor(() => {
                generatorState.visitNodes(node.name)
            })
        })

        generatorState.writeLineHtmlTagWithAttr('dd', node, attr, () => {
            generatorState.visitNodes(node.body)
        })
    },

    (generatorState, node) => {
        // First line contains term
        generatorState.writeLineVisitor(() => {
            generatorState.writeText('**')

            for (const textNode of node.name) {
                generatorState.visitNode(textNode)
            }

            generatorState.writeText('**')
        })

        // Empty line between term and definition
        generatorState.writeLine()

        // Subsequent lines contain definitions
        generatorState.visitNodes(node.body)
    },
)
