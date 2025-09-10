import { RstNode, type RstNodeJson, type RstNodeSource } from '../RstNode.js'
import { removeEscapeChar } from '../../utils/removeEscapeChar.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#comments
// ----------------------------------------------------------------------------

export type RstCommentData = {
    rawText: string
}

export class RstComment extends RstNode {
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
        const root = super.toJSON() as RstNodeJson<RstCommentData>

        root.data = {
            rawText: this._rawText,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstCommentData>): RstComment {
        return new RstComment(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstComment {
        return new RstComment(registrar, structuredClone(this.source), this._rawText)
    }

    override get nodeType(): RstNodeType {
        return 'Comment'
    }

    override get willRenderVisibleContent(): boolean {
        return false
    }

    override get shouldTestTextContent(): boolean {
        return true
    }

    override get textContent(): string {
        return removeEscapeChar(this._rawText)
    }

    override get rawTextContent(): string {
        return this._rawText
    }
}
