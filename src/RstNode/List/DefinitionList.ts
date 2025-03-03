import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson } from '../RstNode.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { RstDefinitionListItem } from './DefinitionListItem.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#definition-lists
// ----------------------------------------------------------------------------

export class RstDefinitionList extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstDefinitionList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstDefinitionList(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstDefinitionList {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstDefinitionList(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'DefinitionList'
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const definitionListItemRe = /^[ ]*(?!\.\.)(?<lineText>.+)$/

export const definitionListParser: RstNodeParser<'DefinitionList'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstDefinitionListItem>()
        while (true) {
            parserState.consumeAllNewLines()

            const listItem = parseListItem(parserState, indentSize)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        if (listItems.length === 0) {
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstDefinitionList(parserState.registrar, { startLineIdx, endLineIdx }, listItems)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number): RstDefinitionListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    // Definition must be immediately after term and is indented
    if (!parserState.peekTest(definitionListItemRe) || !parserState.peekIsIndented(indentSize + parserState.opts.inputIndentSize, 1)) {
        return null
    }

    const termMatches = parserState.peekTest(definitionListItemRe)
    if (!termMatches) {
        return null
    }

    // Consume term that we've already peeked at and tested
    parserState.consume()

    const lineText = termMatches.groups?.lineText ?? ''
    const termSrc = { startLineIdx, endLineIdx: startLineIdx + 1 }
    const termAndClassifiers = parserState.parseInlineNodesWithDelimiter(lineText, termSrc, ' : ')
    const term = termAndClassifiers[0]
    const classifiers = termAndClassifiers.slice(1)

    const definitionBodyNodes = parserState.parseBodyNodes(indentSize + parserState.opts.inputIndentSize, 'DefinitionListItem')
    const endLineIdx = parserState.lineIdx
    return new RstDefinitionListItem(parserState.registrar, { startLineIdx, endLineIdx }, term, classifiers, definitionBodyNodes)
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const definitionListGenerators = createNodeGenerators(
    'DefinitionList',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('dl', node, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)
