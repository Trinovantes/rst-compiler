import { RstBlockquoteAttribution } from '../../RstNode/Block/BlockquoteAttribution.js'
import type { RstNodeParser } from '../RstParser.js'

const blockquoteAttributonRe = /^([ ]*)(?<bulletAndSpace>---?[ ]+)(?<firstLineText>.+)$/

export const blockquoteAttributionParser: RstNodeParser<'BlockquoteAttribution'> = {
    onParseShouldExitBody: true,

    parse: (parserState, indentSize, parentType) => {
        const startLineIdx = parserState.lineIdx

        if (parentType !== 'Blockquote') {
            return null
        }
        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = parserState.peekTest(blockquoteAttributonRe)
        if (!firstLineMatches) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        parserState.consume()

        const bulletAndSpace = firstLineMatches.groups?.bulletAndSpace ?? ''
        const bodyIndentSize = indentSize + bulletAndSpace.length
        const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
        const attributionText = parserState.parseInitContentText(bodyIndentSize, firstLineText)

        const endLineIdx = parserState.lineIdx
        const attributionTextSrc = { startLineIdx, endLineIdx }
        const attributionTextNodes = parserState.parseInlineNodes(attributionText, attributionTextSrc)
        return new RstBlockquoteAttribution(parserState.registrar, attributionTextSrc, attributionTextNodes)
    },
}
