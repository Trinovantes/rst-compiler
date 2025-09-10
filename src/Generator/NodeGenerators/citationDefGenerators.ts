import { HtmlAttributeStore } from '../HtmlAttributeStore.js'
import { createNodeGenerators } from '../RstGenerator.js'

// ----------------------------------------------------------------------------
// MARK: CitationDefGroup
// ----------------------------------------------------------------------------

export const citationDefGroupGenerators = createNodeGenerators(
    'CitationDefGroup',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('dl', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.citationDefGroup }), () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)

// ----------------------------------------------------------------------------
// MARK: CitationDef
// ----------------------------------------------------------------------------

export const citationDefGenerators = createNodeGenerators(
    'CitationDef',

    (generatorState, node) => {
        const backlinks = generatorState.resolveCitationDefBacklinks(node)

        generatorState.writeLineHtmlTag('dt', node, () => {
            generatorState.writeLineHtmlTagWithAttr('span', null, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.citationDef }), () => {
                generatorState.writeLine(node.label)

                if (backlinks.length > 0) {
                    generatorState.writeLineHtmlTagWithAttr('span', null, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.citationDefBacklinks }), () => {
                        for (const [idx, backlink] of backlinks.entries()) {
                            generatorState.writeLine(`<a href="${backlink}">[${idx + 1}]</a>`)
                        }
                    })
                }
            })
        })

        generatorState.writeLineHtmlTag('dd', null, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.writeLine(`[^${node.nthOfType}]:`)
        generatorState.useIndent(() => {
            generatorState.visitNodes(node.children)
        })
    },
)
