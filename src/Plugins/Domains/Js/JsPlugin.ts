import { createRstCompilerPlugins } from '../../../RstCompilerPlugin.ts'
import { RstDirective } from '../../../RstNode/ExplicitMarkup/Directive.ts'
import { RstNode } from '../../../RstNode/RstNode.ts'
import { type SimpleName, normalizeSimpleName } from '../../../SimpleName.ts'
import { jsDirectiveGenerators, jsDirectives } from './jsDirectiveGenerators.ts'
import { jsInterpretedTextGenerators } from './jsInterpretedTextGenerators.ts'
import { getJsLocalName } from './getJsLocalName.ts'
import { getParentModules } from './getParentModules.ts'

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
        const directives = parserOutput.root.findAllChildren('Directive')
        const jsDomainDirectives = directives.filter((node) => jsDirectives.has(node.directive))

        for (const directiveNode of jsDomainDirectives) {
            const simpleName = getJsDirectiveSimpleName(directiveNode)
            if (!simpleName) {
                continue
            }

            parserOutput.simpleNameResolver.registerExplicitNode(directiveNode, simpleName)
            parserOutput.simpleNameResolver.registerNodeAsLinkable(directiveNode, simpleName, true)
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
