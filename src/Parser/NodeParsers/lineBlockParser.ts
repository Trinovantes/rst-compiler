import { RstLineBlock, RstLineBlockLine } from '../../RstNode/Block/LineBlock.js'
import type { RstNodeSource } from '../../RstNode/RstNode.js'
import type { RstNodeParser } from '../RstParser.js'
import { RstParserError } from '../RstParserError.js'
import type { RstParserState } from '../RstParserState.js'

const lineBlockRe = /^([ ]*)\|(?: (?<lineBlockIndent> *)(?<lineBlockText>.+))?$/

export const lineBlockParser: RstNodeParser<'LineBlock'> = {
    parse: (parserState, indentSize) => {
        return parseLineBlock(parserState, indentSize, 0)
    },
}

//
// Inside LineBlock, the left vertical bar prevents us from using the `indentSize` arg to
// recursively track the expected indent size of nested LineBlock
//
//      | text
//      |     text
//        ^^^^
//           |
//           lineBlockIndentSize
//
// Thus we need to use a 3rd parameter to track it
//
function parseLineBlock(parserState: RstParserState, indentSize: number, lineBlockIndentSize: number): RstLineBlock | null {
    const startLineIdx = parserState.lineIdx
    const lines = new Array<RstLineBlock | RstLineBlockLine>()

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }
    if (!parserState.peekTest(lineBlockRe)) {
        return null
    }

    while (true) {
        if (parserState.peekIndentSize() < indentSize) {
            break
        }

        const lineMatches = parserState.peekTest(lineBlockRe)
        if (!lineMatches) {
            break
        }

        const nextBlockIndentSize = lineMatches.groups?.lineBlockIndent?.length ?? 0
        if (nextBlockIndentSize < lineBlockIndentSize) {
            break
        }

        const indentSizeForNestedBlock = lineBlockIndentSize + parserState.opts.inputIndentSize
        if (nextBlockIndentSize >= indentSizeForNestedBlock) {
            const innerBlock = parseLineBlock(parserState, indentSize, nextBlockIndentSize)
            if (!innerBlock) {
                throw new RstParserError(parserState, 'Failed to parseLineBlock')
            }

            lines.push(innerBlock)
        } else {
            parserState.consume()
            const source: RstNodeSource = {
                startLineIdx: parserState.lineIdx - 1,
                endLineIdx: parserState.lineIdx,
            }

            const lineText = lineMatches.groups?.lineBlockText ?? ''
            const lineTextNodes = parserState.parseInlineNodes(lineText, source)

            lines.push(new RstLineBlockLine(
                parserState.registrar,
                source,
                lineTextNodes,
            ))
        }
    }

    if (lines.length === 0) {
        return null
    }

    const endLineIdx = parserState.lineIdx
    return new RstLineBlock(parserState.registrar, { startLineIdx, endLineIdx }, lines)
}
