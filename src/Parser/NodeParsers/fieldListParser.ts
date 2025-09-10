import { RstFieldList } from '../../RstNode/List/FieldList.js'
import { RstFieldListItem } from '../../RstNode/List/FieldListItem.js'
import type { RstNodeParser } from '../RstParser.js'
import type { RstParserState } from '../RstParserState.js'

export const fieldListItemRe = new RegExp(
    '^[ ]*' + // Whitespace at start
    ':(?![: ])' + // Opening colon (cannot be immediately followed by colon or space)
    '(?<fieldName>' +
        '(?:' + // Any of:
            '[^:\\\\]' + '|' + // Any char except : or \
            '\\\\.' + '|' + // Any escaped character

            // If there is a colon, it must NOT be immediately followed by
            // - Space (end of field list)
            // - Backtick (start of interpted text since InterpretedText with prefixed roles are not allowed inside FieldListItem)
            // - End of line (since last colon of FieldListItem must be followed by space and field body)
            ':(?!([ `]|$))' +
        ')*' +
    ')' +
    '(?<![ ]):' + // Closing colon (cannot be immediately preceded by space)
    '(?:' +
        ' ' + // Space
        '(?<firstLineText>.+)' + // Any char to end of line
    ')?' + // Optional firstLineText
    '$',
)

export const fieldListParser: RstNodeParser<'FieldList'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstFieldListItem>()
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
        return new RstFieldList(parserState.registrar, { startLineIdx, endLineIdx }, listItems)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number): RstFieldListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(fieldListItemRe)
    const fieldName = firstLineMatches?.groups?.fieldName
    if (!fieldName) {
        return null
    }

    const fieldNameNodes = parserState.parseInlineNodes(fieldName, {
        startLineIdx,
        endLineIdx: startLineIdx + 1,
    })

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
    const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
    const initContent = parserState.parseInitContent(bodyIndentSize, firstLineText, startLineIdx)
    const listItemChildren = parserState.parseBodyNodes(bodyIndentSize, 'OptionListItem', initContent)

    const endLineIdx = parserState.lineIdx
    return new RstFieldListItem(parserState.registrar, { startLineIdx, endLineIdx }, fieldNameNodes, listItemChildren)
}
