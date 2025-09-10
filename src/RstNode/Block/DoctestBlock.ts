import { RstNode, type RstNodeJson, type RstNodeSource } from '../RstNode.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

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

    override get shouldTestTextContent(): boolean {
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
