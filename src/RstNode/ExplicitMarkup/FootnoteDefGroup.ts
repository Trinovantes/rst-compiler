import { simpleNameReStr } from '@/SimpleName.js'
import { RstNode, RstNodeJson } from '../RstNode.js'
import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { RstFootnoteDef } from './FootnoteDef.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstFootnoteDefGroup extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstFootnoteDefGroup {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstFootnoteDefGroup(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstFootnoteDefGroup {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstFootnoteDefGroup(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'FootnoteDefGroup'
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const footnoteDefRe = new RegExp(
    '^ *\\.\\. +' +
    '\\[' +
        '(?<label>' +
            '[0-9]+' + // Any number
            '|' +
            `#(${simpleNameReStr})?` + // Auto number footnote with optional label
            '|' +
            '\\*' + // Auto symbol
        ')' +
    '\\]' +
    ' +' +
    '(?<firstLineText>.+)$', // Any char to end of line
)

export const footnoteDefGroupParser: RstNodeParser<'FootnoteDefGroup'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const footnoteDefs = new Array<RstFootnoteDef>()
        while (true) {
            parserState.consumeAllNewLines()

            const footnoteDef = parseFootnoteDef(parserState, indentSize)
            if (!footnoteDef) {
                break
            }

            footnoteDefs.push(footnoteDef)
        }

        // Failed to parse any bullet list items thus this is not a bullet list
        if (footnoteDefs.length === 0) {
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstFootnoteDefGroup(parserState.registrar, { startLineIdx, endLineIdx }, footnoteDefs)
    },
}

function parseFootnoteDef(parserState: RstParserState, indentSize: number): RstFootnoteDef | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(footnoteDefRe)
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
    const children = parserState.parseBodyNodes(bodyIndentSize, 'FootnoteDef', initContent)

    const endLineIdx = parserState.lineIdx
    return new RstFootnoteDef(parserState.registrar, { startLineIdx, endLineIdx }, children, rawLabel)
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const footnoteDefGroupGenerators = createNodeGenerators(
    'FootnoteDefGroup',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('dl', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.footnoteDefGroup }), () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)
