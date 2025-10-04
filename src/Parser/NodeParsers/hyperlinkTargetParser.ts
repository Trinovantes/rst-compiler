import { RstHyperlinkTarget } from '../../RstNode/ExplicitMarkup/HyperlinkTarget.ts'
import type { RstNodeParser } from '../RstParser.ts'
import type { RstParserState } from '../RstParserState.ts'

const explicitHyperlinkTargetRe = new RegExp(
    '^ *\\.\\. +' +
    '_' +
        '(?:' +
            '(?<anonymousName>_)' +
            '|' +
            '`(?<phraseName>(?:\\`|[^`])+)`' + // Backtick wraps any character except backtick (unless escaped backtick)
            '|' +
            '(?<linkName>(?:\\:|[^:])+)' + // Any non-colon character except colon (unless escaped colon)
        ')' +
    '(?<!\\\\):' + // Colon cannot be preceded by escape slash
    '(?: (?<firstLineText>.*))?' +
    '$',
)

const anonymousHyperlinkTargetRe = /^ *__(?: (?<hyperlinkTarget>.+))?$/

export const hyperlinkTargetParser: RstNodeParser<'HyperlinkTarget'> = {
    parse: (parserState, indentSize) => {
        return parseExplicitTarget(parserState, indentSize) ?? parseAnonymousTarget(parserState, indentSize)
    },
}

function parseExplicitTarget(parserState: RstParserState, indentSize: number): RstHyperlinkTarget | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(explicitHyperlinkTargetRe)
    if (!firstLineMatches) {
        return null
    }

    const rawLabel = firstLineMatches.groups?.anonymousName ?? firstLineMatches.groups?.phraseName ?? firstLineMatches.groups?.linkName
    if (!rawLabel) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
    const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
    const linkText = parserState.parseInitContentText(bodyIndentSize, firstLineText, false)

    const endLineIdx = parserState.lineIdx
    return new RstHyperlinkTarget(
        parserState.registrar,
        {
            startLineIdx,
            endLineIdx,
        },
        rawLabel,
        linkText,
    )
}

function parseAnonymousTarget(parserState: RstParserState, indentSize: number): RstHyperlinkTarget | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(anonymousHyperlinkTargetRe)
    if (!firstLineMatches) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const hyperlinkTarget = firstLineMatches.groups?.hyperlinkTarget ?? ''

    const endLineIdx = parserState.lineIdx
    return new RstHyperlinkTarget(
        parserState.registrar,
        {
            startLineIdx,
            endLineIdx,
        },
        '_',
        hyperlinkTarget,
    )
}
