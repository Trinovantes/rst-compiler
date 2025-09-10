import { RstFootnoteRef } from '../Inline/FootnoteRef.js'
import { RstNode, type RstNodeJson, type RstNodeObject, type RstNodeSource } from '../RstNode.js'
import { removeEscapeChar } from '../../utils/removeEscapeChar.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#footnotes
// ----------------------------------------------------------------------------

export type RstFootnoteDefData = {
    rawLabel: string
}

export class RstFootnoteDef extends RstNode {
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

        if (this.isManualLabelNum) {
            root.data.isManualLabelNum = true
        }

        if (this.isAutoSymbol) {
            root.data.isAutoSymbol = true
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstFootnoteDefData>

        root.data = {
            rawLabel: this._rawLabel,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstFootnoteDefData>): RstFootnoteDef {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstFootnoteDef(registrar, structuredClone(json.source), children, json.data.rawLabel)
    }

    override clone(registrar: RstNodeRegistrar): RstFootnoteDef {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstFootnoteDef(registrar, structuredClone(this.source), children, this._rawLabel)
    }

    override get nodeType(): RstNodeType {
        return 'FootnoteDef'
    }

    get label(): string {
        return removeEscapeChar(this._rawLabel)
    }

    override toShortString(): string {
        return `${super.toShortString()} label:"${this.label}"`
    }

    get isManualLabelNum(): boolean {
        return /^[1-9]\d*$/.test(this.label)
    }

    get isAutoSymbol(): boolean {
        return this.label === '*'
    }

    isTargetedByFootnoteRef(footnoteRef: RstFootnoteRef): boolean {
        // If this def has a label '#label', then this is only compatible with refs with the same label
        // If this def is a manual number, then this is only compatible with refs with same number
        // If this def is symbol, then this is only compatible with refs with symbol
        if (footnoteRef.textContent === this.label) {
            return true
        }

        // If this def is only '#', then this is compatible with all refs regardless of their labels
        if (footnoteRef.textContent.startsWith('#') && this.label === '#') {
            return true
        }

        return false
    }
}
