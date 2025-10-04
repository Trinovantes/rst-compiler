import { createDirectiveGenerators } from '../../Generator/RstGenerator.ts'
import { createRstCompilerPlugins } from '../../RstCompilerPlugin.ts'
import { generateGlobalToc, generateLocalToc, type TocTree } from './TocTree.ts'
import { normalizeSimpleName, type SimpleName } from '../../SimpleName.ts'
import { RstDirective } from '../../RstNode/ExplicitMarkup/Directive.ts'
import { RstNode } from '../../RstNode/RstNode.ts'
import type { RstGeneratorState } from '../../Generator/RstGeneratorState.ts'
import { HtmlAttributeStore } from '../../Generator/HtmlAttributeStore.ts'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

const CONTENTS_DIRECTIVE = 'contents'

export const contentsDirectiveGenerators = createDirectiveGenerators(
    [
        CONTENTS_DIRECTIVE,
    ],

    (generatorState, node) => {
        const maxDepth = parseInt(node.config?.getField('depth') ?? '6')
        const trees = node.config?.hasField('local')
            ? generateLocalToc(node, maxDepth)
            : generateGlobalToc(node, maxDepth)

        if (!node.initContentText && trees.length === 0) {
            generatorState.writeLineHtmlComment(node.toShortString())
            return
        }

        const attrs = new HtmlAttributeStore({ class: 'contents' })
        const htmlId = generatorState.htmlAttrResolver.getNodeHtmlId(node)
        if (htmlId) {
            attrs.set('id', htmlId)
        }

        generatorState.writeLineHtmlTagWithAttr('div', node, attrs, () => {
            if (node.initContentText) {
                generatorState.writeLineHtmlTagWithAttr('p', null, new HtmlAttributeStore({ class: 'title' }), () => {
                    generatorState.writeLine(node.initContentText)
                })
            }

            if (trees.length > 0) {
                generatorState.writeLineHtmlTag('ul', null, () => {
                    for (const tree of trees) {
                        generateHtmlTocTree(generatorState, tree)
                    }
                })
            }
        })
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const contentsDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        contentsDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithInitContent.push(CONTENTS_DIRECTIVE)
    },

    onParse: (parserOutput) => {
        const directives = parserOutput.root.findAllChildren('Directive')
        const contentsDirectives = directives.filter((node) => node.directive === CONTENTS_DIRECTIVE)

        for (const directiveNode of contentsDirectives) {
            const simpleName = getContentsDirectiveSimpleName(directiveNode)
            if (!simpleName) {
                continue
            }

            parserOutput.simpleNameResolver.registerExplicitNode(directiveNode, simpleName)
            parserOutput.simpleNameResolver.registerNodeAsLinkable(directiveNode, simpleName, true)
        }
    },
})

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getContentsDirectiveSimpleName(node: RstNode): SimpleName | null {
    if (!(node instanceof RstDirective)) {
        return null
    }

    if (node.directive !== CONTENTS_DIRECTIVE) {
        return null
    }

    const name = node.initContentText
    if (!name) {
        return null
    }

    return normalizeSimpleName(name)
}

function generateHtmlTocTree(generatorState: RstGeneratorState, tree: TocTree) {
    generatorState.writeLineHtmlTag('li', null, () => {
        generatorState.writeLineHtmlTag('p', null, () => {
            const url = generatorState.resolveNodeToUrl(tree.section)
            const attrs = new HtmlAttributeStore({ href: url })
            generatorState.writeLineHtmlTagWithAttr('a', null, attrs, () => {
                generatorState.writeLineVisitor(() => {
                    generatorState.visitNodes(tree.section.children)
                })
            })
        })

        if (tree.children.length > 0) {
            generatorState.writeLineHtmlTag('ul', null, () => {
                for (const childTree of tree.children) {
                    generateHtmlTocTree(generatorState, childTree)
                }
            })
        }
    })
}
