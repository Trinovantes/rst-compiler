import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { RstNodeParser } from '@/Parser/RstParser.js'
import { removeEscapeChar } from '@/utils/removeEscapeChar.js'
import { RstFieldList, fieldListParser } from '../List/FieldList.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstDirectiveData = {
    rawDirective: string
    isInvisibleContent: boolean
    initContent: Array<RstNodeJson>
    config: RstNodeJson | null
    rawBodyText?: string
}

export class RstDirective extends RstNode {
    private readonly _rawDirective: string
    private readonly _isInvisibleContent: boolean
    private readonly _initContent: ReadonlyArray<RstNode> // Content on first line of directive
    private readonly _config: RstFieldList | null // FieldList that specifies the Directive's settings
    private readonly _rawBodyText?: string // Content after first linebreak

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        rawDirective: string,
        isInvisibleContent: boolean,
        initContent: ReadonlyArray<RstNode>, // Content on first line of directive
        config: RstFieldList | null, // FieldList that specifies the Directive's settings
        rawBodyText?: string, // Content after first linebreak
    ) {
        super(registrar, source, children)
        this._rawDirective = rawDirective
        this._isInvisibleContent = isInvisibleContent
        this._initContent = initContent
        this._config = config
        this._rawBodyText = rawBodyText
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            directive: this.directive,
        }

        if (this._isInvisibleContent) {
            root.data.isInvisibleContent = this._isInvisibleContent
        }
        if (this.initContent.length > 0) {
            root.data.initContent = this.initContent.map((node) => node.toObject())
        }
        if (this.config) {
            root.data.config = this.config.toObject()
        }
        if (this.rawBodyText) {
            root.data.rawBodyText = this.rawBodyText
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstDirectiveData>

        root.data = {
            rawDirective: this._rawDirective,
            isInvisibleContent: this._isInvisibleContent,
            initContent: this.initContent.map((node) => node.toJSON()),
            config: this.config?.toJSON() ?? null,
            rawBodyText: this.rawBodyText,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstDirectiveData>): RstDirective {
        const initContent = json.data.initContent.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        const config = json.data.config ? RstFieldList.reviveRstNodeFromJson(registrar, json.data.config) : null
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstDirective(registrar, structuredClone(json.source), children, json.data.rawDirective, json.data.isInvisibleContent, initContent, config, json.data.rawBodyText)
    }

    override clone(registrar: RstNodeRegistrar): RstDirective {
        const initContent = this.initContent.map((child) => child.clone(registrar))
        const config = this.config?.clone(registrar) ?? null
        const children = this.children.map((child) => child.clone(registrar))
        return new RstDirective(registrar, structuredClone(this.source), children, this._rawDirective, this._isInvisibleContent, initContent, config, this._rawBodyText)
    }

    override get nodeType(): RstNodeType {
        return 'Directive'
    }

    override get willRenderVisibleContent(): boolean {
        return !this._isInvisibleContent
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

    get rawBodyText(): string {
        return this._rawBodyText ?? ''
    }

    override get isTextContentBasic(): boolean {
        return false
    }

    override toShortString(): string {
        let str = `${super.toShortString()} directive:"${this.directive}" initContentText:"${this.initContentText}"`

        if (this._isInvisibleContent) {
            str += ` isInvisibleContent:${this._isInvisibleContent}`
        }

        return str
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        let str = selfTab + `[${this.toShortString()}] (${this.lineNums})\n`

        if (this.config) {
            str += selfTab + '  (Options)' + '\n'
            str += this.config.toString(depth + 2)
        }

        if (this.children.length > 0) {
            str += selfTab + '  (Children)' + '\n'
            for (const child of this.children) {
                str += child.toString(depth + 2)
            }
        }

        if (this._rawBodyText) {
            str += selfTab + '  (RawBodyText)' + '\n'
            for (const line of this._rawBodyText.split('\n')) {
                str += selfTab + `    "${line}"\n`
            }
        }

        return str
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const directiveRe = new RegExp(
    '^ *.. +' +
    '(?<directive>\\S+)' +
    ' ?(?<!\\\\)::' + // Technically we should not accept the optional space but in practice some docs use it and docutils allows it
    '(?: (?<firstLineText>.*))?' +
    '$',
)

export const directiveParser: RstNodeParser<'Directive'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = parserState.peekTest(directiveRe)
        if (!firstLineMatches) {
            return null
        }

        const directive = firstLineMatches.groups?.directive.toLowerCase()
        if (!directive) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        parserState.consume()

        const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
        const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
        const initContent = parserState.parseInitContent(bodyIndentSize, firstLineText, startLineIdx)
        const directiveConfig = fieldListParser.parse(parserState, bodyIndentSize, 'Directive')

        const isInvisibleContent = parserState.opts.directivesWithInvisibleContent.includes(directive)
        const hasInitContent = parserState.opts.directivesWithInitContent.includes(directive)

        const directiveInitContent = hasInitContent ? initContent : []
        const directiveChildren = hasInitContent ? [] : initContent

        if (parserState.opts.directivesWithRawText.includes(directive)) {
            const rawBodyText = parserState.parseBodyText(bodyIndentSize, 'Directive')
            const endLineIdx = parserState.lineIdx
            return new RstDirective(
                parserState.registrar,
                {
                    startLineIdx,
                    endLineIdx,
                },
                directiveChildren,
                directive,
                isInvisibleContent,
                directiveInitContent,
                directiveConfig,
                rawBodyText,
            )
        } else {
            const children = parserState.parseBodyNodes(bodyIndentSize, 'Directive', directiveChildren)
            const endLineIdx = parserState.lineIdx
            return new RstDirective(
                parserState.registrar,
                {
                    startLineIdx,
                    endLineIdx,
                },
                children,
                directive,
                isInvisibleContent,
                directiveInitContent,
                directiveConfig,
                '',
            )
        }
    },
}
