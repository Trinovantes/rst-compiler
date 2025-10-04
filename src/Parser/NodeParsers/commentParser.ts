import { RstComment } from '../../RstNode/ExplicitMarkup/Comment.ts'
import type { RstNodeParser } from '../RstParser.ts'

const commentRe = /^(?<indent>[ ]*\.\.)(?: (?<commentText>.*))?$/

export const commentParser: RstNodeParser<'Comment'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = parserState.peekTest(commentRe)
        if (!firstLineMatches) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        parserState.consume()

        const firstLineText = firstLineMatches.groups?.commentText
        const bodyIndentSize = indentSize + 2

        const restOfCommentLines = new Array<string>()
        while ((parserState.peekIsContent() && parserState.peekIsAtleastIndented(bodyIndentSize)) || parserState.peekIsNewLine()) {
            const line = parserState.consume()
            restOfCommentLines.push(line.str)
        }

        const commonIndentSize = ((): number => {
            // If first line of comment exists, then subsequent lines are assumed to be aligned with ".. " (3 chars)
            if (firstLineText) {
                return indentSize + 3
            }

            // Otherwise first line is blank (just ".."), then subsequent lines' smallest indentation determine the common indentation
            let smallestIndent = Number.MAX_SAFE_INTEGER

            for (const line of restOfCommentLines) {
                // Ignore empty lines
                if (!line) {
                    continue
                }

                const lineIndent = line.search(/\S|$/) ?? 0
                smallestIndent = Math.min(smallestIndent, lineIndent)
            }

            return smallestIndent
        })()

        // Trim non-first comments
        const restOfCommentText = restOfCommentLines.map((line) => line.substring(commonIndentSize)).join('\n')

        // Finally join everything together
        const commentText = [firstLineText, restOfCommentText].filter((s) => Boolean(s)).join('\n')

        const endLineIdx = parserState.lineIdx
        return new RstComment(
            parserState.registrar,
            {
                startLineIdx,
                endLineIdx,
            },
            commentText,
        )
    },
}
