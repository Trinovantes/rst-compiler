import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { RstCitationRef } from '../Inline/CitationRef.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { removeEscapeChar } from '@/utils/removeEscapeChar.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#citations
// ----------------------------------------------------------------------------

export type RstCitationDefData = {
    rawLabel: string
}

export class RstCitationDef extends RstNode {
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
        return RstNodeType.CitationDef
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

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const citationDefGenerators = createNodeGenerators(
    RstNodeType.CitationDef,

    (generatorState, node) => {
        const backlinks = generatorState.resolveCitationDefBacklinks(node)

        generatorState.writeLineHtmlTag('dt', node, () => {
            generatorState.writeLineHtmlTagWithAttr('span', null, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.citationDef }), () => {
                generatorState.writeLine(node.label)

                if (backlinks.length > 0) {
                    generatorState.writeLineHtmlTagWithAttr('span', null, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.citationDefBacklinks }), () => {
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
        generatorState.writeLine(`[^${node.nthOfType}]:`)
        generatorState.useIndent(() => {
            generatorState.visitNodes(node.children)
        })
    },
)
