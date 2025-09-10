import { createNodeGenerators } from '../RstGenerator.js'

// ----------------------------------------------------------------------------
// MARK: Blockquote
// ----------------------------------------------------------------------------

export const blockquoteGenerators = createNodeGenerators(
    'Blockquote',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('blockquote', node, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.usePrefix({ val: '> ' }, () => {
            generatorState.visitNodes(node.children)
        })
    },
)

// ----------------------------------------------------------------------------
// MARK: BlockquoteAttribution
// ----------------------------------------------------------------------------

export const blockquoteAttributonGenerators = createNodeGenerators(
    'BlockquoteAttribution',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('footer', node, () => {
            generatorState.writeLineHtmlTag('cite', node, () => {
                generatorState.writeLineVisitor(() => {
                    if (generatorState.opts.enableBlockQuoteAttributionDash) {
                        generatorState.writeText('&mdash; ')
                    }

                    generatorState.visitNodes(node.children)
                })
            })
        })
    },

    (generatorState, node) => {
        generatorState.writeLineVisitor(() => {
            if (generatorState.opts.enableBlockQuoteAttributionDash) {
                generatorState.writeText('--- ')
            }

            generatorState.visitNodes(node.children)
        })
    },
)
