import { RstNode, RstNodeJson, RstNodeSource } from '../RstNode.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { RstNodeParser } from '@/Parser/RstParser.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import { RstParserError } from '@/Parser/RstParserError.js'
import { ContinuousText } from '../Inline/Text.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#line-blocks
// ----------------------------------------------------------------------------

export class RstLineBlock extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstLineBlock {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstLineBlock(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstLineBlock {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstLineBlock(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'LineBlock'
    }
}

export class RstLineBlockLine extends RstNode {
    protected readonly textNodes: ContinuousText

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        textNodes: ContinuousText = [],
    ) {
        super(registrar, source, textNodes)
        this.textNodes = textNodes
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstLineBlockLine {
        const children = json.children.map((childJson) => registrar.reviveRstTextFromJson(childJson))
        return new RstLineBlockLine(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstLineBlockLine {
        const children = this.textNodes.map((child) => child.clone(registrar))
        return new RstLineBlockLine(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'LineBlockLine'
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const lineBlockRe = /^([ ]*)\|(?: (?<lineBlockIndent> *)(?<lineBlockText>.+))?$/

export const lineBlockParser: RstNodeParser<'LineBlock'> = {
    parse: (parserState, indentSize) => {
        return parseLineBlock(parserState, indentSize, 0)
    },
}

//
// Inside LineBlock, the left vertical bar prevents us from using the `indentSize` arg to
// recursively track the expected indent size of nested LineBlock
//
//      | text
//      |     text
//        ^^^^
//           |
//           lineBlockIndentSize
//
// Thus we need to use a 3rd parameter to track it
//
function parseLineBlock(parserState: RstParserState, indentSize: number, lineBlockIndentSize: number): RstLineBlock | null {
    const startLineIdx = parserState.lineIdx
    const lines = new Array<RstLineBlock | RstLineBlockLine>()

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }
    if (!parserState.peekTest(lineBlockRe)) {
        return null
    }

    while (true) {
        if (parserState.peekIndentSize() < indentSize) {
            break
        }

        const lineMatches = parserState.peekTest(lineBlockRe)
        if (!lineMatches) {
            break
        }

        const nextBlockIndentSize = lineMatches.groups?.lineBlockIndent?.length ?? 0
        if (nextBlockIndentSize < lineBlockIndentSize) {
            break
        }

        const indentSizeForNestedBlock = lineBlockIndentSize + parserState.opts.inputIndentSize
        if (nextBlockIndentSize >= indentSizeForNestedBlock) {
            const innerBlock = parseLineBlock(parserState, indentSize, nextBlockIndentSize)
            if (!innerBlock) {
                throw new RstParserError(parserState, 'Failed to parseLineBlock')
            }

            lines.push(innerBlock)
        } else {
            parserState.consume()
            const source: RstNodeSource = {
                startLineIdx: parserState.lineIdx - 1,
                endLineIdx: parserState.lineIdx,
            }

            const lineText = lineMatches.groups?.lineBlockText ?? ''
            const lineTextNodes = parserState.parseInlineNodes(lineText, source)

            lines.push(new RstLineBlockLine(
                parserState.registrar,
                source,
                lineTextNodes,
            ))
        }
    }

    if (lines.length === 0) {
        return null
    }

    const endLineIdx = parserState.lineIdx
    return new RstLineBlock(parserState.registrar, { startLineIdx, endLineIdx }, lines)
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const lineBlockGenerators = createNodeGenerators(
    'LineBlock',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.lineBlock }), () => {
            generatorState.useNoLineBreaksBetweenBlocks(() => {
                generatorState.visitNodes(node.children)
            })
        })
    },

    (generatorState, node) => {
        generatorState.usePrefix({ val: '> ' }, () => {
            generatorState.visitNodes(node.children)
        })
    },
)

export const lineBlockLineGenerators = createNodeGenerators(
    'LineBlockLine',

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore({ class: generatorState.opts.htmlClass.lineBlockLine })

        generatorState.writeLineHtmlTagWithAttrInSameLine('div', node, attrs, () => {
            if (node.children.length > 0) {
                generatorState.visitNodes(node.children)
            } else {
                generatorState.writeText('<br />')
            }
        })
    },

    (generatorState, node) => {
        generatorState.writeLineVisitor(() => {
            if (node.children.length > 0) {
                generatorState.visitNodes(node.children)
            } else {
                generatorState.writeText('<br />')
            }
        })
    },
)
