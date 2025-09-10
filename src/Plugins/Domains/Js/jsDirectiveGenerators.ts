import { createDirectiveGenerators } from '../../../Generator/RstGenerator.js'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.js'
import { jsDirectiveOptionsGenerator } from './jsDirectiveOptionsGenerator.js'
import { getParentModules } from './getParentModules.js'
import { HtmlAttributeStore } from '../../../Generator/HtmlAttributeStore.js'
import { RstGeneratorError } from '../../../Generator/RstGeneratorError.js'

export const jsDirectives = new Set([
    'js:module',
    'js:function',
    'js:method',
    'js:class',
    'js:data',
    'js:attribute',
])

export const jsDirectiveGenerators = createDirectiveGenerators(
    [...jsDirectives],

    (generatorState, node) => {
        const directive = /js:(?<directive>\w+)/.exec(node.directive)?.groups?.directive
        if (!directive) {
            throw new RstGeneratorError(generatorState, node, 'Failed to get directive')
        }

        const attrs = new HtmlAttributeStore()
        attrs.append('class', 'js')
        attrs.append('class', directive)

        generatorState.writeLineHtmlTagWithAttr('dl', node, attrs, () => {
            generatorState.writeLineHtmlTag('dt', null, () => {
                const nameChain = [...getParentModules(node), node.initContentText]
                const url = generatorState.resolveNodeToUrl(node)
                generatorState.writeLine(`<code>${sanitizeHtml(nameChain.join('.'))}</code>`)
                generatorState.writeLine(`<a href="${url}">&para;</a>`)
            })

            generatorState.writeLineHtmlTag('dd', null, () => {
                generatorState.useNodeGenerator(jsDirectiveOptionsGenerator.htmlGenerator, () => {
                    generatorState.visitNode(node.config)
                    generatorState.visitNodes(node.children)
                })
            })
        })
    },
)
