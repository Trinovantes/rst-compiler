import { RstParagraph } from '../../RstNode/Block/Paragraph.ts'
import type { RstNodeSource } from '../../RstNode/RstNode.ts'
import type { RstNodeParser } from '../RstParser.ts'

export const paragraphParser: RstNodeParser<'Paragraph'> = {
    parse: (parserState, indentSize, parentType) => {
        const startLineIdx = parserState.lineIdx
        const paragraphText = parserState.parseBodyText(indentSize, parentType, /^[^\n]+$/)
        const endLineIdx = parserState.lineIdx
        const source: RstNodeSource = { startLineIdx, endLineIdx }
        return new RstParagraph(parserState.registrar, source, parserState.parseInlineNodes(paragraphText, source))
    },
}
