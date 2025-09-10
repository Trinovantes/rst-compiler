import { renderCodeBlockHtml } from '../../Plugins/Code/renderCodeBlockHtml.js'
import { renderCodeBlockMd } from '../../Plugins/Code/renderCodeBlockMd.js'
import { HtmlAttributeStore } from '../HtmlAttributeStore.js'
import { createNodeGenerators } from '../RstGenerator.js'

export const docTestBlockGenerators = createNodeGenerators(
    'DoctestBlock',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.docTestBlock }), () => {
            renderCodeBlockHtml(generatorState, 'python', node.rawTextContent, node)
        })
    },

    (generatorState, node) => {
        renderCodeBlockMd(generatorState, 'python', node.rawTextContent)
    },
)
