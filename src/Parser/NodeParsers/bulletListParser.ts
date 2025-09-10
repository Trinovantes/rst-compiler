import { RstBulletList } from '../../RstNode/List/BulletList.js'
import { RstBulletListItem } from '../../RstNode/List/BulletListItem.js'
import type { RstNodeParser } from '../RstParser.js'
import type { RstParserState } from '../RstParserState.js'

const bulletListItemRe = /^[ ]*(?<bulletAndSpace>(?<bullet>[*+-])[ ]+)(?<firstLineText>.+)$/

export const bulletListParser: RstNodeParser<'BulletList'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstBulletListItem>()
        while (true) {
            parserState.consumeAllNewLines()

            const listItem = parseListItem(parserState, indentSize)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        // Failed to parse any bullet list items thus this is not a bullet list
        if (listItems.length === 0) {
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstBulletList(parserState.registrar, { startLineIdx, endLineIdx }, listItems)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number): RstBulletListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(bulletListItemRe)
    if (!firstLineMatches) {
        return null
    }

    const bulletValue = firstLineMatches.groups?.bullet ?? '' // Actual bullet excluding formating e.g. "- text" extracts "-"
    const bulletAndSpace = firstLineMatches.groups?.bulletAndSpace ?? ''
    const bulletIndentSize = indentSize + bulletAndSpace.length

    // Check second line (if exists) to see if this is a valid list vs ordinary paragraph that happens to start with same characters as a bullet
    if (parserState.peekIsContent(1) && !parserState.peekTest(bulletListItemRe, 1) && !parserState.peekIsAtleastIndented(bulletIndentSize, 1)) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
    const initContent = parserState.parseInitContent(bulletIndentSize, firstLineText, startLineIdx)
    const listItemChildren = parserState.parseBodyNodes(bulletIndentSize, 'BulletListItem', initContent)

    const endLineIdx = parserState.lineIdx
    return new RstBulletListItem(parserState.registrar, { startLineIdx, endLineIdx }, listItemChildren, bulletValue)
}
