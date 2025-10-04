import { HtmlAttributeStore } from '../../Generator/HtmlAttributeStore.ts'
import { createDirectiveGenerators } from '../../Generator/RstGenerator.ts'
import { createRstCompilerPlugins } from '../../RstCompilerPlugin.ts'
import { RstDirective } from '../../RstNode/ExplicitMarkup/Directive.ts'
import { parseEmbededRef } from '../../utils/parseEmbededRef.ts'
import { RstNode } from '../../RstNode/RstNode.ts'
import { type SimpleName, normalizeSimpleName } from '../../SimpleName.ts'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

const TOCTREE_DIRECTIVE = 'toctree'

export const tocTreeDirectiveGenerators = createDirectiveGenerators(
    [
        TOCTREE_DIRECTIVE,
    ],

    (generatorState, node) => {
        if (node.config?.hasField('hidden')) {
            generatorState.writeLineHtmlComment(node.toShortString())
            return
        }

        generatorState.writeLineHtmlTagWithAttr('ul', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.tocTree }), () => {
            const lines = node.rawBodyText.split('\n')
            for (const line of lines) {
                if (!line) {
                    continue
                }

                generatorState.writeLineHtmlTag('li', null, () => {
                    const { label, target } = parseEmbededRef(line)
                    const { externalUrl, externalLabel } = generatorState.resolveExternalDoc(node, target)
                    const displayLabel = (label === target)
                        ? externalLabel ?? label
                        : label

                    generatorState.writeLine(`<a href="${externalUrl}">${displayLabel}</a>`)
                })
            }
        })
    },

    (generatorState, node) => {
        if (node.config?.hasField('hidden')) {
            generatorState.writeLineMdComment(node.toShortString())
            return
        }

        const lines = node.rawBodyText.split('\n')
        for (const line of lines) {
            if (!line) {
                continue
            }

            generatorState.usePrefix({
                val: '* ',
                replacementAfterOnce: '  ',
            }, () => {
                const { label, target } = parseEmbededRef(line)
                const { externalUrl, externalLabel } = generatorState.resolveExternalDoc(node, target)
                const displayLabel = (label === target)
                    ? externalLabel ?? label
                    : label

                generatorState.writeLine(`[${displayLabel}](${externalUrl})`)
            })
        }
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const tocTreeDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        tocTreeDirectiveGenerators,
    ],

    getSimpleName: getTocTreeDirectiveSimpleName,

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithRawText.push(TOCTREE_DIRECTIVE)
    },

    onParse: (parserOutput) => {
        const directives = parserOutput.root.findAllChildren('Directive')
        const tocTreeDirectives = directives.filter((node) => node.directive === TOCTREE_DIRECTIVE)

        for (const tocTreeNode of tocTreeDirectives) {
            if (tocTreeNode.config?.hasField('hidden')) {
                continue
            }

            const simpleName = getTocTreeDirectiveSimpleName(tocTreeNode)
            if (!simpleName) {
                continue
            }

            parserOutput.simpleNameResolver.registerExplicitNode(tocTreeNode, simpleName)
            parserOutput.simpleNameResolver.registerNodeAsLinkable(tocTreeNode, simpleName, true)
        }
    },
})

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getTocTreeDirectiveSimpleName(node: RstNode): SimpleName | null {
    if (!(node instanceof RstDirective)) {
        return null
    }

    if (node.directive !== TOCTREE_DIRECTIVE) {
        return null
    }

    const name = node.config?.getField('name')
    if (!name) {
        return null
    }

    return normalizeSimpleName(name)
}
