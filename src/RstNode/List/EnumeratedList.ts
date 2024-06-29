import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { romanLowerRe, romanUpperRe } from '@/utils/romanToInt.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { RstBulletListItem } from './BulletListItem.js'
import { RstEnumeratedListItem } from './EnumeratedListItem.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstEnumeratedListType, getEnumeratedListType, isSequentialBullet } from './EnumeratedListType.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#bullet-lists
// ----------------------------------------------------------------------------

export type RstEnumeratedListData = {
    listType: RstEnumeratedListType
}

export class RstEnumeratedList extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        readonly listType: RstEnumeratedListType,
    ) {
        super(registrar, source, children)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            listType: this.listType,
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstEnumeratedListData>

        root.data = {
            listType: this.listType,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstEnumeratedListData>): RstEnumeratedList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstEnumeratedList(registrar, structuredClone(json.source), children, json.data.listType)
    }

    override clone(registrar: RstNodeRegistrar): RstEnumeratedList {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstEnumeratedList(registrar, structuredClone(this.source), children, this.listType)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.EnumeratedList
    }

    override toShortString(): string {
        return `${super.toShortString()} "${this.listType}"`
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const enumeratedListItemRe = new RegExp(
    '^[ ]*' + // Whitespace at start
    '(?<bulletAndSpace>' +
        '\\(?' + // Opening parenthesis
        '(?<bullet>' +
            '[0-9]+' + // Arabic
            '|' +
            '[A-Za-z]' + // Alphabet
            '|' +
            '#' + // Auto enumerator
            '|' +
            romanUpperRe.source + // Roman Numerals (uppercase)
            '|' +
            romanLowerRe.source + // Roman Numerals (lowercase)
        ')' +
        '[)\\.]' + // Closing parenthesis or period
        '[ ]+' + // Space
    ')' +
    '(?<firstLineText>.+)$', // Any char to end of line
)

export const enumeratedListParser: RstNodeParser<RstNodeType.EnumeratedList> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstEnumeratedListItem>()
        while (true) {
            parserState.consumeAllNewLines()

            const prevBulletValue = listItems.at(-1)?.bullet
            const listItem = parseListItem(parserState, indentSize, prevBulletValue)
            if (!listItem) {
                break
            }

            listItems.push(listItem)
        }

        // Failed to parse any bullet list items thus this is not a bullet list
        if (listItems.length === 0) {
            return null
        }

        const listType = getEnumeratedListType(listItems[0].bullet)
        const endLineIdx = parserState.lineIdx
        return new RstEnumeratedList(parserState.registrar, { startLineIdx, endLineIdx }, listItems, listType)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number, prevBulletValue?: string): RstEnumeratedListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(enumeratedListItemRe)
    if (!firstLineMatches) {
        return null
    }

    const bulletValue = firstLineMatches.groups?.bullet ?? '' // Actual bullet excluding formating e.g. "1. text" extracts "1"
    const bulletAndSpace = firstLineMatches.groups?.bulletAndSpace ?? ''
    const bulletIndentSize = indentSize + bulletAndSpace.length

    // Check second line (if exists) to see if this is a valid list vs ordinary paragraph that happens to start with same characters as a bullet
    if (parserState.peekIsContent(1) && !parserState.peekTest(enumeratedListItemRe, 1) && !parserState.peekIsAtleastIndented(bulletIndentSize, 1)) {
        return null
    }

    // Check if current bullet is sequential (e.g. 1,2,3)
    if (!isSequentialBullet(bulletValue, prevBulletValue)) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
    const initContent = parserState.parseInitContent(bulletIndentSize, firstLineText, startLineIdx)
    const listItemChildren = parserState.parseBodyNodes(bulletIndentSize, RstNodeType.BulletListItem, initContent)

    const endLineIdx = parserState.lineIdx
    return new RstBulletListItem(parserState.registrar, { startLineIdx, endLineIdx }, listItemChildren, bulletValue)
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const enumeratedListGenerators = createNodeGenerators(
    RstNodeType.EnumeratedList,

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore()
        switch (node.listType) {
            case RstEnumeratedListType.AlphabetUpper:
                attrs.set('type', 'A')
                break

            case RstEnumeratedListType.AlphabetLower:
                attrs.set('type', 'a')
                break

            case RstEnumeratedListType.RomanUpper:
                attrs.set('type', 'I')
                break

            case RstEnumeratedListType.RomanLower:
                attrs.set('type', 'i')
                break
        }

        generatorState.writeLineHtmlTagWithAttr('ol', node, attrs, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)
