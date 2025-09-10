import { RstBulletListItem } from '../../RstNode/List/BulletListItem.js'
import { RstEnumeratedList } from '../../RstNode/List/EnumeratedList.js'
import type { RstEnumeratedListItem } from '../../RstNode/List/EnumeratedListItem.js'
import { getEnumeratedListType, isSequentialBullet } from '../../RstNode/List/EnumeratedListType.js'
import { romanUpperRe, romanLowerRe } from '../../utils/romanToInt.js'
import type { RstNodeParser } from '../RstParser.js'
import type { RstParserState } from '../RstParserState.js'

const enumeratedListItemRe = new RegExp(
    '^[ ]*' + // Whitespace at start
    '(?<bulletAndSpace>' +
        '\\(?' + // Opening parenthesis
        '(?<bullet>' +
            '[0-9]+' + // Arabic
            '|' +
            '[A-Za-z]' + // Alphabet
            '|' +
            '#' + // Auto enumerator
            '|' +
            romanUpperRe.source + // Roman Numerals (uppercase)
            '|' +
            romanLowerRe.source + // Roman Numerals (lowercase)
        ')' +
        '[)\\.]' + // Closing parenthesis or period
        '[ ]+' + // Space
    ')' +
    '(?<firstLineText>.+)$', // Any char to end of line
)

export const enumeratedListParser: RstNodeParser<'EnumeratedList'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstEnumeratedListItem>()
        while (true) {
            parserState.consumeAllNewLines()

            const prevBulletValue = listItems.at(-1)?.bullet
            const listItem = parseListItem(parserState, indentSize, prevBulletValue)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        // Failed to parse any bullet list items thus this is not a bullet list
        if (listItems.length === 0) {
            return null
        }

        const listType = getEnumeratedListType(listItems[0].bullet)
        if (listType === null) {
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstEnumeratedList(parserState.registrar, { startLineIdx, endLineIdx }, listItems, listType)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number, prevBulletValue?: string): RstEnumeratedListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(enumeratedListItemRe)
    if (!firstLineMatches) {
        return null
    }

    const bulletValue = firstLineMatches.groups?.bullet ?? '' // Actual bullet excluding formating e.g. "1. text" extracts "1"
    const bulletAndSpace = firstLineMatches.groups?.bulletAndSpace ?? ''
    const bulletIndentSize = indentSize + bulletAndSpace.length

    // Check second line (if exists) to see if this is a valid list vs ordinary paragraph that happens to start with same characters as a bullet
    if (parserState.peekIsContent(1) && !parserState.peekTest(enumeratedListItemRe, 1) && !parserState.peekIsAtleastIndented(bulletIndentSize, 1)) {
        return null
    }

    // Check if current bullet is sequential (e.g. 1,2,3)
    if (!isSequentialBullet(bulletValue, prevBulletValue)) {
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
