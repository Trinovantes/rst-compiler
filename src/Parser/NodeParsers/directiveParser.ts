import { RstDirective } from '../../RstNode/ExplicitMarkup/Directive.js'
import type { RstNodeParser } from '../RstParser.js'
import { fieldListParser } from './fieldListParser.js'

const directiveRe = new RegExp(
    '^ *\\.\\. +' +
    '(?<directive>\\S+)' +
    ' ?(?<!\\\\)::' + // Technically we should not accept the optional space but in practice some docs use it and docutils allows it
    '(?: (?<firstLineText>.*))?' +
    '$',
)

export const directiveParser: RstNodeParser<'Directive'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = parserState.peekTest(directiveRe)
        if (!firstLineMatches) {
            return null
        }

        const directive = firstLineMatches.groups?.directive.toLowerCase()
        if (!directive) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        parserState.consume()

        const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
        const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
        const initContent = parserState.parseInitContent(bodyIndentSize, firstLineText, startLineIdx)
        const directiveConfig = fieldListParser.parse(parserState, bodyIndentSize, 'Directive')

        const isInvisibleContent = parserState.opts.directivesWithInvisibleContent.includes(directive)
        const hasInitContent = parserState.opts.directivesWithInitContent.includes(directive)

        const directiveInitContent = hasInitContent ? initContent : []
        const directiveChildren = hasInitContent ? [] : initContent

        if (parserState.opts.directivesWithRawText.includes(directive)) {
            const rawBodyText = parserState.parseBodyText(bodyIndentSize, 'Directive')
            const endLineIdx = parserState.lineIdx
            return new RstDirective(
                parserState.registrar,
                {
                    startLineIdx,
                    endLineIdx,
                },
                directiveChildren,
                directive,
                isInvisibleContent,
                directiveInitContent,
                directiveConfig,
                rawBodyText,
            )
        } else {
            const children = parserState.parseBodyNodes(bodyIndentSize, 'Directive', directiveChildren)
            const endLineIdx = parserState.lineIdx
            return new RstDirective(
                parserState.registrar,
                {
                    startLineIdx,
                    endLineIdx,
                },
                children,
                directive,
                isInvisibleContent,
                directiveInitContent,
                directiveConfig,
                '',
            )
        }
    },
}
