import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'
import { RstNode } from '@/RstNode/RstNode.js'
import { SimpleName, normalizeSimpleName } from '@/SimpleName.js'
import { jsDirectiveGenerators, jsDirectives } from './jsDirectiveGenerators.js'
import { jsInterpretedTextGenerators } from './jsInterpretedTextGenerators.js'
import { getJsLocalName } from './getJsLocalName.js'
import { getParentModules } from './getParentModules.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'

export const jsDomainPlugins = createRstCompilerPlugins({
    directiveGenerators: [
        jsDirectiveGenerators,
    ],

    interpretedTextGenerators: [
        jsInterpretedTextGenerators,
    ],

    getSimpleName: getJsDirectiveSimpleName,

    onBeforeParse: (parserOption) => {
        for (const directive of jsDirectives) {
            parserOption.directivesWithInitContent.push(directive)
        }
    },

    onParse: (parserOutput) => {
        const directives = parserOutput.root.findAllChildren(RstNodeType.Directive)
        const jsDomainDirectives = directives.filter((node) => jsDirectives.has(node.directive))

        for (const directiveNode of jsDomainDirectives) {
            const simpleName = getJsDirectiveSimpleName(directiveNode)
            if (!simpleName) {
                continue
            }

            parserOutput.simpleNameResolver.registerNodeAsTargetable(directiveNode)
            parserOutput.simpleNameResolver.registerExternalTargetableNode(simpleName, directiveNode)
        }
    },
})

function getJsDirectiveSimpleName(node: RstNode): SimpleName | null {
    if (!(node instanceof RstDirective)) {
        return null
    }

    if (!jsDirectives.has(node.directive)) {
        return null
    }

    const localName = getJsLocalName(node.initContentText)
    const nameChain = [...getParentModules(node), localName]
    return normalizeSimpleName(`js-${nameChain.join('.')}`)
}
