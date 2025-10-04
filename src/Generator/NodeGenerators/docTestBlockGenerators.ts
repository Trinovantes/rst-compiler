import { renderCodeBlockHtml } from '../../Plugins/Code/renderCodeBlockHtml.ts'
import { renderCodeBlockMd } from '../../Plugins/Code/renderCodeBlockMd.ts'
import { HtmlAttributeStore } from '../HtmlAttributeStore.ts'
import { createNodeGenerators } from '../RstGenerator.ts'

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
