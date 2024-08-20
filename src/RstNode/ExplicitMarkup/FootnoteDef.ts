import { RstFootnoteRef } from '../Inline/FootnoteRef.js'
import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { removeEscapeChar } from '@/utils/removeEscapeChar.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#footnotes
// ----------------------------------------------------------------------------

export type RstFootnoteDefData = {
    rawLabel: string
}

export class RstFootnoteDef extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        private readonly _rawLabel: string,
    ) {
        super(registrar, source, children)
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
        return RstNodeType.FootnoteDef
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

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const footnoteDefGenerators = createNodeGenerators(
    RstNodeType.FootnoteDef,

    (generatorState, node) => {
        const label = generatorState.resolveFootnoteDefLabel(node)
        const backlinks = generatorState.resolveFootnoteDefBacklinks(node)

        generatorState.writeLineHtmlTag('dt', node, () => {
            generatorState.writeLineHtmlTagWithAttr('span', null, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.footnoteDef }), () => {
                generatorState.writeLine(label)

                if (backlinks.length > 0) {
                    generatorState.writeLineHtmlTagWithAttr('span', null, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.footnoteDefBacklinks }), () => {
                        for (const [idx, backlink] of backlinks.entries()) {
                            generatorState.writeLine(`<a href="${backlink}">[${idx + 1}]</a>`)
                        }
                    })
                }
            })
        })

        generatorState.writeLineHtmlTag('dd', null, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        const label = generatorState.resolveFootnoteDefLabel(node)

        generatorState.writeLine(`[^${label}]:`)
        generatorState.useIndent(() => {
            generatorState.visitNodes(node.children)
        })
    },
)
