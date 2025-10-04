import { RstNode, type RstNodeJson, type RstNodeObject, type RstNodeSource } from '../RstNode.ts'
import { removeEscapeChar } from '../../utils/removeEscapeChar.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'
import { emailRe, urlRe } from '../../utils/parseEmbededRef.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#hyperlink-targets

// Explicit                         .. _label: link
// Anonymous                        .. __: link
// Anonymous (alt)                  __ link

// Chain Explicit                   .. _label:
// Chain Anonymous                  .. __:
// Chain Anonymous (alt)            __
// ----------------------------------------------------------------------------

export type RstHyperlinkTargetData = {
    rawLabel: string
    rawTarget: string
}

export class RstHyperlinkTarget extends RstNode {
    private readonly _rawLabel: string
    private readonly _rawTarget: string

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        rawLabel: string,
        rawTarget: string,
    ) {
        super(registrar, source)
        this._rawLabel = rawLabel
        this._rawTarget = rawTarget
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

        if (this.isTargetingNextNode) {
            if (!root.data) {
                root.data = {}
            }

            root.data.isTargetingNextNode = true
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstHyperlinkTargetData>

        root.data = {
            rawLabel: this._rawLabel,
            rawTarget: this._rawTarget,
        }

        return root
    }

    override equals(other: RstNode): boolean {
        if (!(other instanceof RstHyperlinkTarget)) {
            return false
        }

        return this._rawLabel === other._rawLabel && this._rawTarget === other._rawTarget
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstHyperlinkTargetData>): RstHyperlinkTarget {
        return new RstHyperlinkTarget(registrar, structuredClone(json.source), json.data.rawLabel, json.data.rawTarget)
    }

    override clone(registrar: RstNodeRegistrar): RstHyperlinkTarget {
        return new RstHyperlinkTarget(registrar, structuredClone(this.source), this._rawLabel, this._rawTarget)
    }

    override get nodeType(): RstNodeType {
        return 'HyperlinkTarget'
    }

    override get willRenderVisibleContent(): boolean {
        return false
    }

    get label(): string {
        return removeEscapeChar(this._rawLabel)
    }

    get target(): string {
        return removeEscapeChar(this._rawTarget, true)
    }

    get isAnonymous(): boolean {
        return this._rawLabel === '_'
    }

    get isAlias(): boolean {
        const isUrl = new RegExp(`^${urlRe.source}$`).test(this.target)
        const isEmail = new RegExp(`^${emailRe.source}$`).test(this.target)

        // If it's url/email, then it cannot be an alias
        if (isUrl || isEmail) {
            return false
        }

        return this._rawTarget.endsWith('_') && !this._rawTarget.endsWith('\\_')
    }

    get isTargetingNextNode(): boolean {
        return this._rawTarget.length === 0
    }

    override toShortString(): string {
        let str = `${super.toShortString()} label:"${this.label}" target:"${this.target}"`

        if (this.isAnonymous) {
            str += ` isAnonymous:${this.isAnonymous}`
        }
        if (this.isAlias) {
            str += ` isAlias:${this.isAlias}`
        }
        if (this.isTargetingNextNode) {
            str += ` isTargetingNextNode:${this.isTargetingNextNode}`
        }

        return str
    }
}
