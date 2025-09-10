import { renderCodeBlockHtml } from '../../Plugins/Code/renderCodeBlockHtml.js'
import { renderCodeBlockMd } from '../../Plugins/Code/renderCodeBlockMd.js'
import { HtmlAttributeStore } from '../HtmlAttributeStore.js'
import { createNodeGenerators } from '../RstGenerator.js'

export const literalBlockGenerators = createNodeGenerators(
    'LiteralBlock',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.literalBlock }), () => {
            const language = generatorState.opts.defaultLiteralBlockLanguage
            renderCodeBlockHtml(generatorState, language, node.rawTextContent, node)
        })
    },

    (generatorState, node) => {
        const language = generatorState.opts.defaultLiteralBlockLanguage
        renderCodeBlockMd(generatorState, language, node.rawTextContent)
    },
)
