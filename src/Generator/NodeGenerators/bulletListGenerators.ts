import { createNodeGenerators } from '../RstGenerator.js'
import { RstEnumeratedList } from '../../RstNode/List/EnumeratedList.js'
import { HtmlAttributeStore } from '../HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: BulletList
// ----------------------------------------------------------------------------

export const bulletListGenerators = createNodeGenerators(
    'BulletList',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('ul', node, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)

// ----------------------------------------------------------------------------
// MARK: BulletListItem
// ----------------------------------------------------------------------------

export const bulletListItemGenerators = createNodeGenerators(
    'BulletListItem',

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore()
        if (node.parent instanceof RstEnumeratedList && node.isFirstChild() && !node.isEnumeratedListFirstValue()) {
            attrs.set('value', node.getEnumeratedListValue(generatorState).toString())
        }

        generatorState.writeLineHtmlTagWithAttr('li', node, attrs, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        const bullet = node.parent instanceof RstEnumeratedList
            ? `${node.getEnumeratedListValue(generatorState)}. `
            : `${node.bullet} `
        const bulletWhitespace = ' '.repeat(bullet.length)

        generatorState.usePrefix({
            val: bullet,
            replacementAfterOnce: bulletWhitespace,
        }, () => {
            generatorState.visitNodes(node.children)
        })
    },
)
