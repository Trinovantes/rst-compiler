import { HtmlAttributeStore } from '../HtmlAttributeStore.ts'
import { createNodeGenerators } from '../RstGenerator.ts'

// ----------------------------------------------------------------------------
// MARK: FootnoteDefGroup
// ----------------------------------------------------------------------------

export const footnoteDefGroupGenerators = createNodeGenerators(
    'FootnoteDefGroup',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('dl', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.footnoteDefGroup }), () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)

// ----------------------------------------------------------------------------
// MARK: FootnoteDef
// ----------------------------------------------------------------------------

export const footnoteDefGenerators = createNodeGenerators(
    'FootnoteDef',

    (generatorState, node) => {
        const label = generatorState.resolveFootnoteDefLabel(node)
        const backlinks = generatorState.resolveFootnoteDefBacklinks(node)

        generatorState.writeLineHtmlTag('dt', node, () => {
            generatorState.writeLineHtmlTagWithAttr('span', null, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.footnoteDef }), () => {
                generatorState.writeLine(label)

                if (backlinks.length > 0) {
                    generatorState.writeLineHtmlTagWithAttr('span', null, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.footnoteDefBacklinks }), () => {
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
        const label = generatorState.resolveFootnoteDefLabel(node)

        generatorState.writeLine(`[^${label}]:`)
        generatorState.useIndent(() => {
            generatorState.visitNodes(node.children)
        })
    },
)
