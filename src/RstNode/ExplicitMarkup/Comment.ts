import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson, RstNodeSource } from '../RstNode.js'
import { removeEscapeChar } from '@/utils/removeEscapeChar.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#comments
// ----------------------------------------------------------------------------

export type RstCommentData = {
    rawText: string
}

export class RstComment extends RstNode {
    private readonly _rawText: string

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        rawText: string,
    ) {
        super(registrar, source)
        this._rawText = rawText
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstCommentData>

        root.data = {
            rawText: this._rawText,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstCommentData>): RstComment {
        return new RstComment(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstComment {
        return new RstComment(registrar, structuredClone(this.source), this._rawText)
    }

    override get nodeType(): RstNodeType {
        return 'Comment'
    }

    override get willRenderVisibleContent(): boolean {
        return false
    }

    override get isTextContentBasic(): boolean {
        return true
    }

    override get textContent(): string {
        return removeEscapeChar(this._rawText)
    }

    override get rawTextContent(): string {
        return this._rawText
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const commentGenerators = createNodeGenerators(
    'Comment',

    (generatorState, node) => {
        generatorState.writeLineHtmlComment(sanitizeHtml(node.textContent))
    },

    (generatorState, node) => {
        generatorState.writeLineMdComment(sanitizeHtml(node.textContent))
    },
)
