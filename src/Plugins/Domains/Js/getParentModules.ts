import { RstDirective } from '../../../RstNode/ExplicitMarkup/Directive.js'
import { RstNode } from '../../../RstNode/RstNode.js'
import { getJsLocalName } from './getJsLocalName.js'

export function getParentModules(node: RstDirective): Array<string> {
    const nameChain = new Array<string>()

    // Walk up tree to find all js:module js:class that contribute to the full name
    let parent: RstNode | null = node
    while (true) {
        parent = parent.parent
        if (!parent) {
            break
        }

        if (!(parent instanceof RstDirective)) {
            continue
        }
        if (parent.directive !== 'js:class' && parent.directive !== 'js:module') {
            continue
        }

        const localName = getJsLocalName(parent.initContentText)
        if (!localName) {
            continue
        }

        nameChain.unshift(localName)
    }

    return nameChain
}
