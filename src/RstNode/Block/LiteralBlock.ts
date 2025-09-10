import { RstNode, type RstNodeJson, type RstNodeSource } from '../RstNode.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

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

    override get shouldTestTextContent(): boolean {
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
