import { HtmlAttributeStore } from '../../Generator/HtmlAttributeStore.js'
import { createDirectiveGenerators } from '../../Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '../../RstCompilerPlugin.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

const CENTERED_DIRECTIVE = 'centered'

export const centeredDirectiveGenerators = createDirectiveGenerators(
    [
        CENTERED_DIRECTIVE,
    ],

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.directiveCentered }), () => {
            generatorState.visitNodes(node.children)
        })
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const centeredDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        centeredDirectiveGenerators,
    ],
})
