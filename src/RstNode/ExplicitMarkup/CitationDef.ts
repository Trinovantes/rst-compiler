import { RstNode, type RstNodeJson, type RstNodeObject, type RstNodeSource } from '../RstNode.js'
import { RstCitationRef } from '../Inline/CitationRef.js'
import { removeEscapeChar } from '../../utils/removeEscapeChar.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#citations
// ----------------------------------------------------------------------------

export type RstCitationDefData = {
    rawLabel: string
}

export class RstCitationDef extends RstNode {
    private readonly _rawLabel: string

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        rawLabel: string,
    ) {
        super(registrar, source, children)
        this._rawLabel = rawLabel
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            label: this.label,
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstCitationDefData>

        root.data = {
            rawLabel: this._rawLabel,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstCitationDefData>): RstCitationDef {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstCitationDef(registrar, structuredClone(json.source), children, json.data.rawLabel)
    }

    override clone(registrar: RstNodeRegistrar): RstCitationDef {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstCitationDef(registrar, structuredClone(this.source), children, this._rawLabel)
    }

    override get nodeType(): RstNodeType {
        return 'CitationDef'
    }

    get label(): string {
        return removeEscapeChar(this._rawLabel)
    }

    override toShortString(): string {
        return `${super.toShortString()} label:"${this.label}"`
    }

    isTargetedByCitationRef(citationRef: RstCitationRef): boolean {
        return this.label === citationRef.textContent
    }
}
