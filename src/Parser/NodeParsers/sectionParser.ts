import { RstSection } from '../../RstNode/Block/Section.js'
import { escapeForRegExp } from '../../utils/escapeForRegExp.js'
import type { RstNodeParser } from '../RstParser.js'
import type { RstParserState } from '../RstParserState.js'

export const sectionChars  = ['=', '-', '`', ':', '.', "'", '"', '~', '^', '_', '*', '+', '#']
export const sectionMarkRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).map((c) => `${c}{2,}`).join('|')})[ ]*$`)

export const sectionParser: RstNodeParser<'Section'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        const section = getSectionInfo(parserState)
        if (!section) {
            return null
        }

        // Advance parser after the overline, body text, and underline
        parserState.advance(section.numLinesConsumed)

        const endLineIdx = parserState.lineIdx
        const sectionTextNodes = parserState.parseInlineNodes(section.sectionText, {
            startLineIdx: startLineIdx + (section.hasOverline ? 1 : 0),
            endLineIdx: endLineIdx - 1,
        })

        const sectionLevel = parserState.registerSectionMarker(section.sectionMarker)
        return new RstSection(parserState.registrar, { startLineIdx, endLineIdx }, sectionTextNodes, sectionLevel)
    },
}

type SectionInfo = {
    hasOverline: boolean
    sectionText: string
    sectionMarker: string
    numLinesConsumed: number
}

function getSectionInfo(parserState: RstParserState): SectionInfo | null {
    let hasOverline: boolean
    if (parserState.peekTest(sectionMarkRe, 0) && parserState.peekTest(sectionMarkRe, 2)) {
        hasOverline = true
    } else if (parserState.peekTest(sectionMarkRe, 1)) {
        hasOverline = false
    } else {
        return null
    }

    if (hasOverline) {
        const overline = parserState.peek(0)?.str
        const sectionText = parserState.peek(1)?.str
        const underline = parserState.peek(2)?.str
        if (overline !== underline) {
            return null
        }
        if (sectionText === undefined || underline === undefined) {
            return null
        }

        return {
            hasOverline,
            sectionText,
            sectionMarker: underline[0],
            numLinesConsumed: 3,
        }
    } else {
        const sectionText = parserState.peek(0)?.str
        const underline = parserState.peek(1)?.str
        if (sectionText === undefined || underline === undefined) {
            return null
        }

        return {
            hasOverline,
            sectionText,
            sectionMarker: underline[0],
            numLinesConsumed: 2,
        }
    }
}
