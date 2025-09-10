import { HtmlAttributeStore } from '../HtmlAttributeStore.js'
import { createNodeGenerators } from '../RstGenerator.js'
import { sanitizeHtml } from '../../utils/sanitizeHtml.js'

// ----------------------------------------------------------------------------
// MARK: OptionList
// ----------------------------------------------------------------------------

export const optionListGenerators = createNodeGenerators(
    'OptionList',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('dl', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.optionList }), () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)

// ----------------------------------------------------------------------------
// MARK: OptionListItem
// ----------------------------------------------------------------------------

export const optionListItemGenerators = createNodeGenerators(
    'OptionListItem',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('dt', node, () => {
            generatorState.writeLineVisitor(() => {
                generatorState.writeText('<kbd>')

                for (const [idx, option] of node.options.entries()) {
                    if (idx > 0) {
                        generatorState.writeText(', ')
                    }

                    generatorState.writeText(`<span class="${generatorState.opts.htmlClass.optionListItemOption}">`)

                    generatorState.writeText(sanitizeHtml(option.name))
                    if (option.rawArgName && option.delimiter) {
                        generatorState.writeText(option.delimiter)
                        generatorState.writeText(`<var>${sanitizeHtml(option.rawArgName)}</var>`)
                    }

                    generatorState.writeText('</span>')
                }

                generatorState.writeText('</kbd>')
            })
        })

        generatorState.writeLineHtmlTag('dd', node, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        // First line contains option
        generatorState.writeLineVisitor(() => {
            generatorState.writeText('`')

            for (const [idx, option] of node.options.entries()) {
                if (idx > 0) {
                    generatorState.writeText(', ')
                }

                generatorState.writeText(option.name)
                if (option.rawArgName && option.delimiter) {
                    generatorState.writeText(option.delimiter)
                    generatorState.writeText(option.rawArgName) // Don't sanitize since this is written inside literal text
                }
            }

            generatorState.writeText('`')
        })

        // Empty line between option and description
        generatorState.writeLine()

        // Subsequent lines contain description
        generatorState.visitNodes(node.children)
    },
)
