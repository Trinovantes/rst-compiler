import { HtmlAttributeStore } from '../HtmlAttributeStore.js'
import { createNodeGenerators } from '../RstGenerator.js'

export const enumeratedListGenerators = createNodeGenerators(
    'EnumeratedList',

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore()
        switch (node.listType) {
            case 'AlphabetUpper':
                attrs.set('type', 'A')
                break

            case 'AlphabetLower':
                attrs.set('type', 'a')
                break

            case 'RomanUpper':
                attrs.set('type', 'I')
                break

            case 'RomanLower':
                attrs.set('type', 'i')
                break
        }

        generatorState.writeLineHtmlTagWithAttr('ol', node, attrs, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)
