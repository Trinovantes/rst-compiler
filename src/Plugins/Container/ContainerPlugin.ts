import { HtmlAttributeStore } from '../../Generator/HtmlAttributeStore.ts'
import { createDirectiveGenerators } from '../../Generator/RstGenerator.ts'
import { createRstCompilerPlugins } from '../../RstCompilerPlugin.ts'
import { normalizeSimpleName } from '../../SimpleName.ts'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

const CONTAINER_DIRECTIVE = 'container'

export const containerDirectiveGenerators = createDirectiveGenerators(
    [
        CONTAINER_DIRECTIVE,
    ],

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore()
        attrs.append('class', generatorState.opts.htmlClass.directiveContainer)
        attrs.append('class', normalizeSimpleName(node.initContentText))

        generatorState.writeLineHtmlTagWithAttr('div', node, attrs, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const containerDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        containerDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithInitContent.push(CONTAINER_DIRECTIVE)
    },
})
