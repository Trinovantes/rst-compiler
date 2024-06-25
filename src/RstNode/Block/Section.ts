import { escapeForRegExp } from '@/utils/escapeForRegExp.js'
import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeType } from '../RstNodeType.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { ContinuousText } from '../Inline/Text.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#sections
// ----------------------------------------------------------------------------

export type RstSectionData = {
    level: number
}

export class RstSection extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        protected readonly textNodes: ContinuousText = [],
        readonly level: number,
    ) {
        super(registrar, source, textNodes)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            level: this.level,
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstSectionData>

        root.data = {
            level: this.level,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstSectionData>): RstSection {
        const children = json.children.map((childJson) => registrar.reviveRstTextFromJson(childJson))
        return new RstSection(registrar, structuredClone(json.source), children, json.data.level)
    }

    override clone(registrar: RstNodeRegistrar): RstSection {
        const children = this.textNodes.map((child) => child.clone(registrar))
        return new RstSection(registrar, structuredClone(this.source), children, this.level)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.Section
    }

    override toShortString(): string {
        return `${super.toShortString()} level:${this.level}`
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

export const sectionChars  = ['=', '-', '`', ':', '.', "'", '"', '~', '^', '_', '*', '+', '#']
export const sectionMarkRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).map((c) => `${c}{2,}`).join('|')})[ ]*$`)

export const sectionParser: RstNodeParser<RstNodeType.Section> = {
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

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const sectionGenerators = createNodeGenerators(
    RstNodeType.Section,

    (generatorState, node) => {
        generatorState.writeLineHtmlTag(`h${node.level}`, node, () => {
            generatorState.writeLineVisitor(() => {
                generatorState.visitNodes(node.children)
            })
        })
    },

    (generatorState, node) => {
        const simpleName = generatorState.simpleNameResolver.getSimpleName(node)

        generatorState.writeLineVisitor(() => {
            generatorState.writeText('#'.repeat(node.level))
            generatorState.writeText(' ')
            generatorState.visitNodes(node.children)
            generatorState.writeText(` {#${simpleName}}`)
        })
    },
)
