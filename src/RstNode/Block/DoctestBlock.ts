import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import { renderCodeBlockHtml } from '@/Plugins/Code/renderCodeBlockHtml.js'
import { renderCodeBlockMd } from '@/Plugins/Code/renderCodeBlockMd.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#doctest-blocks
// ----------------------------------------------------------------------------

export type RstDoctestBlockData = {
    rawText: string
}

export class RstDoctestBlock extends RstNode {
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
        const root = super.toJSON() as RstNodeJson<RstDoctestBlockData>

        root.data = {
            rawText: this._rawText,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstDoctestBlockData>): RstDoctestBlock {
        return new RstDoctestBlock(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstDoctestBlock {
        return new RstDoctestBlock(registrar, structuredClone(this.source), this._rawText)
    }

    override get nodeType(): RstNodeType {
        return 'DoctestBlock'
    }

    override get isTextContentBasic(): boolean {
        return true
    }

    override get textContent(): string {
        // Don't escape code
        return this._rawText
    }

    override get rawTextContent(): string {
        return this._rawText
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const doctestBlockRe = /^([ ]*)>>> (.+)$/

export const doctestBlockParser: RstNodeParser<'DoctestBlock'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekTest(doctestBlockRe)) {
            return null
        }

        const doctestBlockText = parserState.parseBodyText(indentSize, 'DoctestBlock', /^[^\n]+$/)
        const endLineIdx = parserState.lineIdx
        return new RstDoctestBlock(parserState.registrar, { startLineIdx, endLineIdx }, doctestBlockText)
    },
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const docTestBlockGenerators = createNodeGenerators(
    'DoctestBlock',

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.docTestBlock }), () => {
            renderCodeBlockHtml(generatorState, 'python', node.rawTextContent, node)
        })
    },

    (generatorState, node) => {
        renderCodeBlockMd(generatorState, 'python', node.rawTextContent)
    },
)
