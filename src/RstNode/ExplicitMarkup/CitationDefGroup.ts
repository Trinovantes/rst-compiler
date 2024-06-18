import { simpleNameReStr } from '@/SimpleName.js'
import { RstNode, RstNodeJson } from '../RstNode.js'
import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { RstCitationDef } from './CitationDef.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstCitationDefGroup extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstCitationDefGroup {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstCitationDefGroup(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstCitationDefGroup {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstCitationDefGroup(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.CitationDefGroup
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const citationDefRe = new RegExp(
    '^ *.. +' +
    '\\[' +
        `(?<label>${simpleNameReStr})` +
    '\\]' +
    ' +' +
    '(?<firstLineText>.+)$', // Any char to end of line
)

export const citationGroupParser: RstNodeParser<RstNodeType.CitationDefGroup> = {
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
    const children = parserState.parseBodyNodes(bodyIndentSize, RstNodeType.CitationDef, initContent)

    const endLineIdx = parserState.lineIdx
    return new RstCitationDef(parserState.registrar, { startLineIdx, endLineIdx }, children, rawLabel)
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const citationDefGroupGenerators = createNodeGenerators(
    RstNodeType.CitationDefGroup,

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('dl', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.citationDefGroup }), () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)
