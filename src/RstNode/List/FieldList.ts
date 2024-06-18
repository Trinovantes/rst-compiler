import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson } from '../RstNode.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { RstFieldListItem } from './FieldListItem.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#field-lists
// ----------------------------------------------------------------------------

export class RstFieldList extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstFieldList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstFieldList(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstFieldList {
        const clonedChildren = this.children.map((child) => child.clone(registrar))
        return new RstFieldList(registrar, structuredClone(this.source), clonedChildren)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.FieldList
    }

    hasField(fieldName: string): boolean {
        return this.getField(fieldName) !== null
    }

    getField(fieldName: string): string | null {
        for (const child of this.children) {
            if (!(child instanceof RstFieldListItem)) {
                continue
            }

            if (child.nameText === fieldName) {
                return child.bodyText
            }
        }

        return null
    }

    toMapString(): string {
        const lines = new Array<string>()

        for (const child of this.children) {
            if (!(child instanceof RstFieldListItem)) {
                continue
            }

            lines.push(`"${child.nameText}":"${child.bodyText}"`)
        }

        return lines.join('\n')
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

export const fieldListItemRe = new RegExp(
    '^[ ]*' + // Whitespace at start
    ':(?![: ])' + // Opening colon (cannot be immediately followed by colon or space)
    '(?<fieldName>' +
        '(?:' + // Any of:
            '[^:\\\\]' + '|' + // Any char except : or \
            '\\\\.' + '|' + // Any escaped character

            // If there is a colon, it must NOT be immediately followed by
            // - Space (end of field list)
            // - Backtick (start of interpted text since InterpretedText with prefixed roles are not allowed inside FieldListItem)
            // - End of line (since last colon of FieldListItem must be followed by space and field body)
            ':(?!([ `]|$))' +
        ')*' +
    ')' +
    '(?<![ ]):' + // Closing colon (cannot be immediately preceded by space)
    '(?:' +
        ' ' + // Space
        '(?<firstLineText>.+)' + // Any char to end of line
    ')?' + // Optional firstLineText
    '$',
)

export const fieldListParser: RstNodeParser<RstNodeType.FieldList> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const listItems = new Array<RstFieldListItem>()
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
        return new RstFieldList(parserState.registrar, { startLineIdx, endLineIdx }, listItems)
    },
}

function parseListItem(parserState: RstParserState, indentSize: number): RstFieldListItem | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(fieldListItemRe)
    const fieldName = firstLineMatches?.groups?.fieldName
    if (!fieldName) {
        return null
    }

    const fieldNameNodes = parserState.parseInlineNodes(fieldName, {
        startLineIdx,
        endLineIdx: startLineIdx + 1,
    })

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
    const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
    const initContent = parserState.parseInitContent(bodyIndentSize, firstLineText, startLineIdx)
    const listItemChildren = parserState.parseBodyNodes(bodyIndentSize, RstNodeType.OptionListItem, initContent)

    const endLineIdx = parserState.lineIdx
    return new RstFieldListItem(parserState.registrar, { startLineIdx, endLineIdx }, fieldNameNodes, listItemChildren)
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const fieldListGenerators = createNodeGenerators(
    RstNodeType.FieldList,

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('dl', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.fieldList }), () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.visitNodes(node.children)
    },
)
