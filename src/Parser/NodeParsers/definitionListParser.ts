import { RstDefinitionList } from '../../RstNode/List/DefinitionList.ts'
import { RstDefinitionListItem } from '../../RstNode/List/DefinitionListItem.ts'
import type { RstNodeParser } from '../RstParser.ts'
import type { RstParserState } from '../RstParserState.ts'

const definitionListItemRe = /^[ ]*(?!\.\.)(?<lineText>.+)$/

export const definitionListParser: RstNodeParser<'DefinitionList'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstDefinitionListItem>()
        while (true) {
            parserState.consumeAllNewLines()

            const listItem = parseListItem(parserState, indentSize)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        if (listItems.length === 0) {
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstDefinitionList(parserState.registrar, { startLineIdx, endLineIdx }, listItems)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number): RstDefinitionListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    // Definition must be immediately after term and is indented
    if (!parserState.peekTest(definitionListItemRe) || !parserState.peekIsIndented(indentSize + parserState.opts.inputIndentSize, 1)) {
        return null
    }

    const termMatches = parserState.peekTest(definitionListItemRe)
    if (!termMatches) {
        return null
    }

    // Consume term that we've already peeked at and tested
    parserState.consume()

    const lineText = termMatches.groups?.lineText ?? ''
    const termSrc = { startLineIdx, endLineIdx: startLineIdx + 1 }
    const termAndClassifiers = parserState.parseInlineNodesWithDelimiter(lineText, termSrc, ' : ')
    const term = termAndClassifiers[0]
    const classifiers = termAndClassifiers.slice(1)

    const definitionBodyNodes = parserState.parseBodyNodes(indentSize + parserState.opts.inputIndentSize, 'DefinitionListItem')
    const endLineIdx = parserState.lineIdx
    return new RstDefinitionListItem(parserState.registrar, { startLineIdx, endLineIdx }, term, classifiers, definitionBodyNodes)
}
