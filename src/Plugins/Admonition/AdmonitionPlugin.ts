import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import { createDirectiveGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { normalizeSimpleName } from '@/SimpleName.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

export const specificAdmonitionDirectiveGenerators = createDirectiveGenerators(
    [
        'info',
        'attention',
        'caution',
        'danger',
        'error',
        'hint',
        'important',
        'seealso',
        'note',
        'tip',
        'warning',
    ],

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore()
        attrs.append('class', generatorState.opts.htmlClass.directiveAdmonition)
        attrs.append('class', node.directive)

        generatorState.writeLineHtmlTagWithAttr('div', node, attrs, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        const containerType = ((): string => {
            switch (node.directive) {
                case 'info':
                case 'note':
                case 'hint':
                case 'important':
                case 'seealso':
                    return 'info'

                case 'tip':
                    return 'tip'

                case 'warning':
                    return 'warning'

                case 'attention':
                case 'caution':
                case 'danger':
                case 'error':
                    return 'danger'

                default:
                    return 'info'
            }
        })()

        generatorState.writeLine(`::: ${containerType}`)
        generatorState.visitNodes(node.children)
        generatorState.writeLine(':::')
    },
)

const GENERIC_ADMONITION_DIRECTIVE = 'admonition'

export const genericAdmonitionDirectiveGenerators = createDirectiveGenerators(
    [
        GENERIC_ADMONITION_DIRECTIVE,
    ],

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore()
        attrs.append('class', generatorState.opts.htmlClass.directiveAdmonition)
        attrs.append('class', node.directive)
        attrs.append('class', normalizeSimpleName(node.initContentText))

        generatorState.writeLineHtmlTagWithAttr('div', node, attrs, () => {
            generatorState.visitNodes(node.initContent)
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.writeLine(`::: ${normalizeSimpleName(node.initContentText)}`)
        generatorState.visitNodes(node.children)
        generatorState.writeLine(':::')
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const admonitionDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        specificAdmonitionDirectiveGenerators,
        genericAdmonitionDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithInitContent.push(GENERIC_ADMONITION_DIRECTIVE)
    },
})
