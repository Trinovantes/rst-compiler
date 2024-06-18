import { createDirectiveGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

export const htmlClassDirectiveGenerators = createDirectiveGenerators(
    [
        'class',
        'rst-class',
    ],

    (generatorState, node) => {
        generatorState.writeLineHtmlComment(node.toShortString())
        if (node.children.length > 0) {
            generatorState.writeLine()
            generatorState.visitNodes(node.children)
        }
    },

    (generatorState, node) => {
        generatorState.writeLineMdComment(node.toShortString())
        if (node.children.length > 0) {
            generatorState.writeLine()
            generatorState.visitNodes(node.children)
        }
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const htmlClassDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        htmlClassDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        for (const directive of htmlClassDirectiveGenerators.directives) {
            parserOption.directivesWithInitContent.push(directive)
        }
    },

    onParse: (parserOutput) => {
        const directiveNodes = parserOutput.root.findAllChildren(RstNodeType.Directive)

        for (const directiveNode of directiveNodes) {
            if (!htmlClassDirectiveGenerators.directives.includes(directiveNode.directive)) {
                continue
            }

            const targetNodes = (() => {
                if (directiveNode.children.length > 0) {
                    // Apply class to child nodes if they exist
                    return directiveNode.children
                } else {
                    // Apply class to next rendered node in tree if any
                    let targetNode = directiveNode.getNextNodeInTree()
                    while (targetNode !== null) {
                        if (targetNode.willRenderVisibleContent) {
                            break
                        }

                        targetNode = targetNode.getNextNodeInTree()
                    }

                    if (!targetNode) {
                        return []
                    }

                    return [targetNode]
                }
            })()

            for (const targetNode of targetNodes) {
                parserOutput.htmlAttrResolver.registerNodeWithClass(targetNode, directiveNode)
            }
        }
    },
})
