import { RstBlockquote } from '../../RstNode/Block/Blockquote.ts'
import type { RstNodeParser } from '../RstParser.ts'

export const blockquoteParser: RstNodeParser<'Blockquote'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const nextIndentSize = indentSize + parserState.opts.inputIndentSize
        if (!parserState.peekIsAtleastIndented(nextIndentSize)) {
            return null
        }

        const children = parserState.parseBodyNodes(nextIndentSize, 'Blockquote')

        const endLineIdx = parserState.lineIdx
        return new RstBlockquote(parserState.registrar, { startLineIdx, endLineIdx }, children)
    },
}
