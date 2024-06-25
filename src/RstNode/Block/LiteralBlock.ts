import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { RstParagraph } from './Paragraph.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import { renderCodeBlockMd } from '@/Plugins/Code/renderCodeBlockMd.js'
import { renderCodeBlockHtml } from '@/Plugins/Code/renderCodeBlockHtml.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#literal-blocks
// ----------------------------------------------------------------------------

export type RstLiteralBlockData = {
    rawText: string
}

export class RstLiteralBlock extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        private readonly _rawText: string,
    ) {
        super(registrar, source)
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstLiteralBlockData>

        root.data = {
            rawText: this._rawText,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstLiteralBlockData>): RstLiteralBlock {
        return new RstLiteralBlock(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstLiteralBlock {
        return new RstLiteralBlock(registrar, structuredClone(this.source), this._rawText)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.LiteralBlock
    }

    override get isTextContentBasic(): boolean {
        return true
    }

    override get textContent(): string {
        // Do not escape inside LiteralBlock since by definition it should be raw text
        return this._rawText
    }

    override get rawTextContent(): string {
        return this._rawText
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const quotedLiteralBlockRe = /^([ ]*)>+(?: .+)?$/

export const literalBlockParser: RstNodeParser<RstNodeType.LiteralBlock> = {
    parse: (parserState, indentSize, parentType, prevNode) => {
        const startLineIdx = parserState.lineIdx

        if (!(prevNode instanceof RstParagraph)) {
            return null
        }

        const prevNodelastChild = prevNode.children.at(-1)
        if (prevNodelastChild?.nodeType !== RstNodeType.Text) { // "::" must be in base Text node
            return null
        }
        if (!prevNodelastChild.textContent.endsWith('::')) {
            return null
        }

        const indentedBlockSize = indentSize + parserState.opts.inputIndentSize
        let literalText = ''

        if (parserState.peekIsIndented(indentedBlockSize)) {
            // Indented literal block must be on next level of indentation
            literalText = parserState.parseBodyText(indentedBlockSize, RstNodeType.LiteralBlock)
        } else if (parserState.peekTest(quotedLiteralBlockRe)) {
            // Quoted literal block must be on same indentation as current body
            literalText = parserState.parseBodyText(indentSize, RstNodeType.LiteralBlock, quotedLiteralBlockRe)
        } else {
            // Not a literal block despite prev paragraph indicating that it is
            return null
        }

        const endLineIdx = parserState.lineIdx
        return new RstLiteralBlock(parserState.registrar, { startLineIdx, endLineIdx }, literalText)
    },
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const literalBlockGenerators = createNodeGenerators(
    RstNodeType.LiteralBlock,

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.literalBlock }), () => {
            renderCodeBlockHtml(generatorState, 'txt', node.rawTextContent, node)
        })
    },

    (generatorState, node) => {
        renderCodeBlockMd(generatorState, 'txt', node.rawTextContent)
    },
)
