import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson } from '../RstNode.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { RstBulletListItem } from './BulletListItem.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
// ----------------------------------------------------------------------------

export class RstBulletList extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstBulletList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstBulletList(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstBulletList {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstBulletList(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'BulletList'
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const bulletListItemRe = /^[ ]*(?<bulletAndSpace>(?<bullet>[*+-])[ ]+)(?<firstLineText>.+)$/

export const bulletListParser: RstNodeParser<'BulletList'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstBulletListItem>()
        while (true) {
            parserState.consumeAllNewLines()

            const listItem = parseListItem(parserState, indentSize)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        // Failed to parse any bullet list items thus this is not a bullet list
        if (listItems.length === 0) {
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstBulletList(parserState.registrar, { startLineIdx, endLineIdx }, listItems)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number): RstBulletListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(bulletListItemRe)
    if (!firstLineMatches) {
        return null
    }

    const bulletValue = firstLineMatches.groups?.bullet ?? '' // Actual bullet excluding formating e.g. "- text" extracts "-"
    const bulletAndSpace = firstLineMatches.groups?.bulletAndSpace ?? ''
    const bulletIndentSize = indentSize + bulletAndSpace.length

    // Check second line (if exists) to see if this is a valid list vs ordinary paragraph that happens to start with same characters as a bullet
    if (parserState.peekIsContent(1) && !parserState.peekTest(bulletListItemRe, 1) && !parserState.peekIsAtleastIndented(bulletIndentSize, 1)) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
    const initContent = parserState.parseInitContent(bulletIndentSize, firstLineText, startLineIdx)
    const listItemChildren = parserState.parseBodyNodes(bulletIndentSize, 'BulletListItem', initContent)

    const endLineIdx = parserState.lineIdx
    return new RstBulletListItem(parserState.registrar, { startLineIdx, endLineIdx }, listItemChildren, bulletValue)
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const bulletListGenerators = createNodeGenerators(
    'BulletList',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('ul', node, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)
