import { RstOptionList } from '../../RstNode/List/OptionList.ts'
import { RstOptionListItem, type CommandOption } from '../../RstNode/List/OptionListItem.ts'
import type { RstNodeParser } from '../RstParser.ts'
import type { RstParserState } from '../RstParserState.ts'

const optionListItemOptionArgRe = /[a-zA-Z][a-zA-Z0-9_-]*|<.+>/

const optionListItemOptionRe = new RegExp(
    '(?<=(?:^|, ))' + // Must be preceded by start of line or ", "
    '(' +
        `(-[a-zA-Z0-9])(?:( )(${optionListItemOptionArgRe.source}))?` + // Short form (delimiter must be space)
    '|' +
        `(--[a-zA-Z][a-zA-Z-]*)(?:( |=)(${optionListItemOptionArgRe.source}))?` + // Long form (delimiter can either be equals or space)
    '|' +
        '(\\/[A-Z])' + // DOS/VMS-style option
    ')',
)

const optionListItemRe = new RegExp(
    '^[ ]*' + // Whitespace at start
    optionListItemOptionRe.source + // Must match the start of an option
    '.*$', // Any char to end of line
)

export const optionListParser: RstNodeParser<'OptionList'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstOptionListItem>()
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
        return new RstOptionList(parserState.registrar, { startLineIdx, endLineIdx }, listItems)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number): RstOptionListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(optionListItemRe)
    if (!firstLineMatches) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const options = new Array<CommandOption>()
    const optionReWithState = new RegExp(optionListItemOptionRe, 'g')
    const optionMatches = firstLineMatches[0].matchAll(optionReWithState)

    // Advance parsedStrIdx to next non-whitespace char
    // Afterwards, parsedStrIdx will point to the char after option
    //
    // -a   Output all.
    //      |
    //      parsedStrIdx (descStartIdx)
    //
    let parsedStrIdx = 0
    for (const optionMatch of optionMatches) {
        parsedStrIdx = (optionMatch.index ?? 0) + optionMatch[0].length

        options.push({
            name: optionMatch[2] ?? optionMatch[5] ?? optionMatch[8],
            delimiter: optionMatch[3] ?? optionMatch[6],
            rawArgName: optionMatch[4] ?? optionMatch[7],
        })
    }

    const nextNonWhitespaceIdx = firstLineMatches[0].substring(parsedStrIdx).search(/\S/)
    const descStartIdx = parsedStrIdx + Math.max(nextNonWhitespaceIdx, 0)
    const firstLineText = firstLineMatches[0].substring(descStartIdx)
    const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
    const initContent = parserState.parseInitContent(bodyIndentSize, firstLineText, startLineIdx)
    const listItemChildren = parserState.parseBodyNodes(bodyIndentSize, 'OptionListItem', initContent)

    const endLineIdx = parserState.lineIdx
    return new RstOptionListItem(parserState.registrar, { startLineIdx, endLineIdx }, listItemChildren, options)
}
