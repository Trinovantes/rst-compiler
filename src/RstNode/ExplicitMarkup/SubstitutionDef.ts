import { RstNode, type RstNodeJson, type RstNodeObject, type RstNodeSource } from '../RstNode.ts'
import { removeEscapeChar } from '../../utils/removeEscapeChar.ts'
import { RstFieldList } from '../List/FieldList.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstSubstitutionDefData = {
    rawNeedle: string
    rawDirective: string
    initContent: Array<RstNodeJson>
    config: RstNodeJson | null
}

export class RstSubstitutionDef extends RstNode {
    private readonly _rawNeedle: string
    private readonly _rawDirective: string
    private readonly _initContent: ReadonlyArray<RstNode> // Content on first line of directive
    private readonly _config: RstFieldList | null // FieldList that specifies the Directive's settings

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        rawNeedle: string,
        rawDirective: string,
        initContent: ReadonlyArray<RstNode>, // Content on first line of directive
        config: RstFieldList | null, // FieldList that specifies the Directive's settings
    ) {
        super(registrar, source, children)
        this._rawNeedle = rawNeedle
        this._rawDirective = rawDirective
        this._initContent = initContent
        this._config = config
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            needle: this.needle,
            directive: this.directive,
        }

        if (this.initContent.length > 0) {
            root.data.initContent = this.initContent.map((node) => node.toObject())
        }
        if (this.config) {
            root.data.config = this.config.toObject()
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstSubstitutionDefData>

        root.data = {
            rawNeedle: this._rawNeedle,
            rawDirective: this._rawDirective,
            initContent: this.initContent.map((node) => node.toJSON()),
            config: this.config?.toJSON() ?? null,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstSubstitutionDefData>): RstSubstitutionDef {
        const initContent = json.data.initContent.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        const config = json.data.config ? RstFieldList.reviveRstNodeFromJson(registrar, json.data.config) : null
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstSubstitutionDef(registrar, structuredClone(json.source), children, json.data.rawNeedle, json.data.rawDirective, initContent, config)
    }

    override clone(registrar: RstNodeRegistrar): RstSubstitutionDef {
        const initContent = this.initContent.map((child) => child.clone(registrar))
        const config = this.config?.clone(registrar) ?? null
        const children = this.children.map((child) => child.clone(registrar))
        return new RstSubstitutionDef(registrar, structuredClone(this.source), children, this._rawNeedle, this._rawDirective, initContent, config)
    }

    override get nodeType(): RstNodeType {
        return 'SubstitutionDef'
    }

    override get willRenderVisibleContent(): boolean {
        return false
    }

    get needle(): string {
        return removeEscapeChar(this._rawNeedle)
    }

    get directive(): string {
        return removeEscapeChar(this._rawDirective)
    }

    get initContent(): ReadonlyArray<RstNode> {
        return this._initContent
    }

    get initContentText(): string {
        return this._initContent.map((child) => child.textContent).join()
    }

    get config(): RstFieldList | null {
        return this._config
    }

    override toShortString(): string {
        let str = `${super.toShortString()} needle:"${this.needle}" directive:"${this.directive}"`

        if (this.initContentText) {
            str += ` initContentText:"${this.initContentText}"`
        }

        return str
    }
}
