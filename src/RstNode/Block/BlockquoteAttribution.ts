import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { ContinuousText } from '../Inline/Text.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
// ----------------------------------------------------------------------------

export class RstBlockquoteAttribution extends RstNode {
    protected readonly textNodes: ContinuousText

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        textNodes: ContinuousText = [],
    ) {
        super(registrar, source, textNodes)
        this.textNodes = textNodes
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstBlockquoteAttribution {
        const children = json.children.map((childJson) => registrar.reviveRstTextFromJson(childJson))
        return new RstBlockquoteAttribution(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstBlockquoteAttribution {
        const children = this.textNodes.map((child) => child.clone(registrar))
        return new RstBlockquoteAttribution(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'BlockquoteAttribution'
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const blockquoteAttributonRe = /^([ ]*)(?<bulletAndSpace>---?[ ]+)(?<firstLineText>.+)$/

export const blockquoteAttributionParser: RstNodeParser<'BlockquoteAttribution'> = {
    onParseShouldExitBody: true,

    parse: (parserState, indentSize, parentType) => {
        const startLineIdx = parserState.lineIdx

        if (parentType !== 'Blockquote') {
            return null
        }
        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = parserState.peekTest(blockquoteAttributonRe)
        if (!firstLineMatches) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        parserState.consume()

        const bulletAndSpace = firstLineMatches.groups?.bulletAndSpace ?? ''
        const bodyIndentSize = indentSize + bulletAndSpace.length
        const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
        const attributionText = parserState.parseInitContentText(bodyIndentSize, firstLineText)

        const endLineIdx = parserState.lineIdx
        const attributionTextSrc = { startLineIdx, endLineIdx }
        const attributionTextNodes = parserState.parseInlineNodes(attributionText, attributionTextSrc)
        return new RstBlockquoteAttribution(parserState.registrar, attributionTextSrc, attributionTextNodes)
    },
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const blockquoteAttributonGenerators = createNodeGenerators(
    'BlockquoteAttribution',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('footer', node, () => {
            generatorState.writeLineHtmlTag('cite', node, () => {
                generatorState.writeLineVisitor(() => {
                    if (generatorState.opts.enableBlockQuoteAttributionDash) {
                        generatorState.writeText('&mdash; ')
                    }

                    generatorState.visitNodes(node.children)
                })
            })
        })
    },

    (generatorState, node) => {
        generatorState.writeLineVisitor(() => {
            if (generatorState.opts.enableBlockQuoteAttributionDash) {
                generatorState.writeText('--- ')
            }

            generatorState.visitNodes(node.children)
        })
    },
)
