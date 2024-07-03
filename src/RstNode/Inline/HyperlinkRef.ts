import { RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { RstText, RstTextData } from './Text.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { parseEmbededRef } from '@/utils/parseEmbededRef.js'
import { normalizeSimpleName } from '@/SimpleName.js'
import { RstGeneratorState } from '@/Generator/RstGeneratorState.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstHyperlinkRefData = RstTextData & {
    isAnonymous: boolean
}

export class RstHyperlinkRef extends RstText {
    private readonly _embededInfo: ReturnType<typeof parseEmbededRef>

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        rawText: string,
        readonly isAnonymous: boolean,
    ) {
        super(registrar, source, rawText)
        this._embededInfo = parseEmbededRef(rawText, true)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        if (this.label !== this.target) {
            root.data = {
                label: this.label,
                target: this.target,
            }
        }

        if (this.isAnonymous) {
            if (!root.data) {
                root.data = {}
            }

            root.data.isAnonymous = true
        }

        if (this.isAlias) {
            if (!root.data) {
                root.data = {}
            }

            root.data.isAlias = true
        }

        if (this.isEmbeded) {
            if (!root.data) {
                root.data = {}
            }

            root.data.isEmbeded = true
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstHyperlinkRefData>

        root.data = {
            rawText: this.rawText,
            isAnonymous: this.isAnonymous,
        }

        return root
    }

    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstHyperlinkRefData>): RstHyperlinkRef {
        return new RstHyperlinkRef(registrar, structuredClone(json.source), json.data.rawText, json.data.isAnonymous)
    }

    override clone(registrar: RstNodeRegistrar): RstHyperlinkRef {
        return new RstHyperlinkRef(registrar, structuredClone(this.source), this.rawText, this.isAnonymous)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.HyperlinkRef
    }

    override get textContent(): string {
        return this.label
    }

    override get rawTextContent(): string {
        return this.rawText
    }

    get label(): string {
        return this._embededInfo.label
    }

    get target(): string {
        return this._embededInfo.target
    }

    get isAlias(): boolean {
        return this._embededInfo.isAlias
    }

    get isEmbeded(): boolean {
        return this._embededInfo.isEmbeded
    }

    override toShortString(): string {
        let str = `${super.toShortString()} label:"${this.label}" target:"${this.target}"`

        if (this.isAnonymous) {
            str += ` isAnonymous:${this.isAnonymous}`
        }
        if (this.isAlias) {
            str += ` isAlias:${this.isAlias}`
        }
        if (this.isEmbeded) {
            str += ` isEmbeded:${this.isEmbeded}`
        }

        return str
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const hyperlinkRefGenerators = createNodeGenerators(
    RstNodeType.HyperlinkRef,

    (generatorState, node) => {
        const url = getHyperlinkRefUrl(generatorState, node)
        generatorState.writeTextWithLinePrefix(`<a href="${url}">${sanitizeHtml(node.label)}</a>`)
    },

    (generatorState, node) => {
        const url = getHyperlinkRefUrl(generatorState, node)
        generatorState.writeTextWithLinePrefix(`[${sanitizeHtml(node.label)}](${url})`)
    },
)

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getHyperlinkRefUrl(generatorState: RstGeneratorState, node: RstHyperlinkRef): string {
    // HyperlinkRefs can be written without space between label and angle brackets
    // Some expect the angle brackets to contain the target url
    // Others expect the whole string as label
    // Thus we need to test both cases
    if (node.isEmbeded) {
        const simpleName = generatorState.simpleNameResolver.getSimpleName(node)
        const altSimpleName = normalizeSimpleName(`${node.label}<${node.target}>`)
        return generatorState.resolveNodeWithMultipleSimpleNamesToUrl(node, [altSimpleName, simpleName])
    } else {
        return generatorState.resolveNodeToUrl(node)
    }
}
