import { renderCodeBlockHtml } from '../../Plugins/Code/renderCodeBlockHtml.ts'
import { renderCodeBlockMd } from '../../Plugins/Code/renderCodeBlockMd.ts'
import { HtmlAttributeStore } from '../HtmlAttributeStore.ts'
import { createNodeGenerators } from '../RstGenerator.ts'

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
