import { RstLiteralBlock } from '../../RstNode/Block/LiteralBlock.js'
import { RstParagraph } from '../../RstNode/Block/Paragraph.js'
import type { RstNodeParser } from '../RstParser.js'

const quotedLiteralBlockRe = /^([ ]*)>+(?: .+)?$/

export const literalBlockParser: RstNodeParser<'LiteralBlock'> = {
    parse: (parserState, indentSize, parentType, prevNode) => {
        const startLineIdx = parserState.lineIdx

        if (!(prevNode instanceof RstParagraph)) {
            return null
        }

        const prevNodelastChild = prevNode.children.at(-1)
        if (prevNodelastChild?.nodeType !== 'Text') { // "::" must be in base Text node
            return null
        }
        if (!prevNodelastChild.textContent.endsWith('::')) {
            return null
        }

        const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
        let literalText = ''

        if (parserState.peekIsAtleastIndented(bodyIndentSize)) {
            // Indented literal block must be on next level of indentation
            literalText = parserState.parseBodyText(bodyIndentSize, 'LiteralBlock')
        } else if (parserState.peekIsIndented(indentSize) && parserState.peekTest(quotedLiteralBlockRe)) {
            // Quoted literal block must be on same indentation as current body
            literalText = parserState.parseBodyText(indentSize, 'LiteralBlock', quotedLiteralBlockRe)
        } else {
            // Not a literal block despite prev paragraph indicating that it is
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstLiteralBlock(parserState.registrar, { startLineIdx, endLineIdx }, literalText)
    },
}
