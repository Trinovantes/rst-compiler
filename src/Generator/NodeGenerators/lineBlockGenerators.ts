import { HtmlAttributeStore } from '../HtmlAttributeStore.ts'
import { createNodeGenerators } from '../RstGenerator.ts'

export const lineBlockGenerators = createNodeGenerators(
    'LineBlock',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.lineBlock }), () => {
            generatorState.useNoLineBreaksBetweenBlocks(() => {
                generatorState.visitNodes(node.children)
            })
        })
    },

    (generatorState, node) => {
        generatorState.usePrefix({ val: '> ' }, () => {
            generatorState.visitNodes(node.children)
        })
    },
)

export const lineBlockLineGenerators = createNodeGenerators(
    'LineBlockLine',

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore({ class: generatorState.opts.htmlClass.lineBlockLine })

        generatorState.writeLineHtmlTagWithAttrInSameLine('div', node, attrs, () => {
            if (node.children.length > 0) {
                generatorState.visitNodes(node.children)
            } else {
                generatorState.writeText('<br />')
            }
        })
    },

    (generatorState, node) => {
        generatorState.writeLineVisitor(() => {
            if (node.children.length > 0) {
                generatorState.visitNodes(node.children)
            } else {
                generatorState.writeText('<br />')
            }
        })
    },
)
