import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { RstText } from '../RstNode/Inline/Text.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'

export function mergeSequentialTextNodes(registrar: RstNodeRegistrar, tokens: Array<RstText>): Array<RstText> {
    const mergedTokens = new Array<RstText>()
    if (tokens.length > 0) {
        mergedTokens.push(tokens[0])
    }

    for (let i = 1; i < tokens.length; i++) {
        const prevToken = mergedTokens.at(-1)
        const currToken = tokens[i]

        if (prevToken?.nodeType === RstNodeType.Text && currToken.nodeType === RstNodeType.Text) {
            mergedTokens[mergedTokens.length - 1] = new RstText(registrar, currToken.source, prevToken.textContent + currToken.textContent)
        } else {
            mergedTokens.push(currToken)
        }
    }

    return mergedTokens
}
