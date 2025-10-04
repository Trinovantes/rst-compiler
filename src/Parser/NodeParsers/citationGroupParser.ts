import { RstCitationDef } from '../../RstNode/ExplicitMarkup/CitationDef.ts'
import { RstCitationDefGroup } from '../../RstNode/ExplicitMarkup/CitationDefGroup.ts'
import { simpleNameReStr } from '../../SimpleName.ts'
import type { RstNodeParser } from '../RstParser.ts'
import type { RstParserState } from '../RstParserState.ts'

const citationDefRe = new RegExp(
    '^ *\\.\\. +' +
    '\\[' +
        `(?<label>${simpleNameReStr})` +
    '\\]' +
    ' +' +
    '(?<firstLineText>.+)$', // Any char to end of line
)

export const citationGroupParser: RstNodeParser<'CitationDefGroup'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const citationDefs = new Array<RstCitationDef>()
        while (true) {
            parserState.consumeAllNewLines()

            const citationDef = parseCitationDef(parserState, indentSize)
            if (!citationDef) {
                break
            }

            citationDefs.push(citationDef)
        }

        // Failed to parse any bullet list items thus this is not a bullet list
        if (citationDefs.length === 0) {
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstCitationDefGroup(parserState.registrar, { startLineIdx, endLineIdx }, citationDefs)
    },
}

function parseCitationDef(parserState: RstParserState, indentSize: number): RstCitationDef | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(citationDefRe)
    if (!firstLineMatches) {
        return null
    }

    const rawLabel = firstLineMatches.groups?.label
    if (!rawLabel) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
    const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
    const initContent = parserState.parseInitContent(bodyIndentSize, firstLineText, startLineIdx)
    const children = parserState.parseBodyNodes(bodyIndentSize, 'CitationDef', initContent)

    const endLineIdx = parserState.lineIdx
    return new RstCitationDef(parserState.registrar, { startLineIdx, endLineIdx }, children, rawLabel)
}
