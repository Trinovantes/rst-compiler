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
    private readonly _rawText: string

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        rawText: string,
    ) {
        super(registrar, source)
        this._rawText = rawText
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
        return 'LiteralBlock'
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

export const literalBlockParser: RstNodeParser<'LiteralBlock'> = {
    parse: (parserState, indentSize, parentType, prevNode) => {
        const startLineIdx = parserState.lineIdx

        if (!(prevNode instanceof RstParagraph)) {
            return null
        }

        const prevNodelastChild = prevNode.children.at(-1)
        if (prevNodelastChild?.nodeType !== 'Text') { // "::" must be in base Text node
            return null
        }
        if (!prevNodelastChild.textContent.endsWith('::')) {
            return null
        }

        const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
        let literalText = ''

        if (parserState.peekIsAtleastIndented(bodyIndentSize)) {
            // Indented literal block must be on next level of indentation
            literalText = parserState.parseBodyText(bodyIndentSize, 'LiteralBlock')
        } else if (parserState.peekIsIndented(indentSize) && parserState.peekTest(quotedLiteralBlockRe)) {
            // Quoted literal block must be on same indentation as current body
            literalText = parserState.parseBodyText(indentSize, 'LiteralBlock', quotedLiteralBlockRe)
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
    'LiteralBlock',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.literalBlock }), () => {
            const language = generatorState.opts.defaultLiteralBlockLanguage
            renderCodeBlockHtml(generatorState, language, node.rawTextContent, node)
        })
    },

    (generatorState, node) => {
        const language = generatorState.opts.defaultLiteralBlockLanguage
        renderCodeBlockMd(generatorState, language, node.rawTextContent)
    },
)
