import { RstDoctestBlock } from '../../RstNode/Block/DoctestBlock.ts'
import type { RstNodeParser } from '../RstParser.ts'

const doctestBlockRe = /^([ ]*)>>> (.+)$/

export const doctestBlockParser: RstNodeParser<'DoctestBlock'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekTest(doctestBlockRe)) {
            return null
        }

        const doctestBlockText = parserState.parseBodyText(indentSize, 'DoctestBlock', /^[^\n]+$/)
        const endLineIdx = parserState.lineIdx
        return new RstDoctestBlock(parserState.registrar, { startLineIdx, endLineIdx }, doctestBlockText)
    },
}
