import { RstSubstitutionDef } from '../../RstNode/ExplicitMarkup/SubstitutionDef.js'
import type { RstNodeParser } from '../RstParser.js'
import { fieldListParser } from './fieldListParser.js'

const substitutionDefRe = new RegExp(
    '^ *\\.\\. +' +
    '\\|(?<needle>.+)\\| ' +
    '(?<directive>\\S+)' +
    '(?<!\\\\)::' +
    '(?: (?<firstLineText>.*))?' +
    '$',
)

export const substitutionDefParser: RstNodeParser<'SubstitutionDef'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = parserState.peekTest(substitutionDefRe)
        if (!firstLineMatches) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        parserState.consume()

        const needle = firstLineMatches.groups?.needle ?? ''
        const directive = firstLineMatches.groups?.directive ?? ''
        const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
        const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
        const initContent = parserState.parseInitContent(bodyIndentSize, firstLineText, startLineIdx)
        const directiveConfig = fieldListParser.parse(parserState, bodyIndentSize, 'SubstitutionDef')

        const directiveInitContent = directive === 'image'
            ? initContent
            : []
        const directiveChildren = directive === 'image'
            ? []
            : initContent
        const children = parserState.parseBodyNodes(bodyIndentSize, 'SubstitutionDef', directiveChildren)

        const endLineIdx = parserState.lineIdx
        return new RstSubstitutionDef(
            parserState.registrar,
            {
                startLineIdx,
                endLineIdx,
            },
            children,
            needle,
            directive,
            directiveInitContent,
            directiveConfig,
        )
    },
}
