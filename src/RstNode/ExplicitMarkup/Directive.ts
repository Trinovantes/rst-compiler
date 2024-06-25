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
    initContent: Array<RstNodeJson>
    config: RstNodeJson | null
    rawBodyText?: string
}

export class RstDirective extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        private readonly _rawDirective: string,
        private readonly _initContent: ReadonlyArray<RstNode>, // Content on first line of directive
        private readonly _config: RstFieldList | null, // FieldList that specifies the Directive's settings
        private readonly _rawBodyText?: string, // Content after first linebreak
    ) {
        super(registrar, source, children)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            directive: this.directive,
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
        return new RstDirective(registrar, structuredClone(json.source), children, json.data.rawDirective, initContent, config, json.data.rawBodyText)
    }

    override clone(registrar: RstNodeRegistrar): RstDirective {
        const initContent = this.initContent.map((child) => child.clone(registrar))
        const config = this.config?.clone(registrar) ?? null
        const children = this.children.map((child) => child.clone(registrar))
        return new RstDirective(registrar, structuredClone(this.source), children, this._rawDirective, initContent, config, this._rawBodyText)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.Directive
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
        return `${super.toShortString()} directive:"${this.directive}" initContentText:"${this.initContentText}"`
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

export const directiveParser: RstNodeParser<RstNodeType.Directive> = {
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
        const directiveConfig = fieldListParser.parse(parserState, bodyIndentSize, RstNodeType.Directive)

        const directiveInitContent = parserState.opts.directivesWithInitContent.includes(directive)
            ? initContent
            : []
        const directiveChildren = parserState.opts.directivesWithInitContent.includes(directive)
            ? []
            : initContent

        if (parserState.opts.directivesWithRawText.includes(directive)) {
            const rawBodyText = parserState.parseBodyText(bodyIndentSize, RstNodeType.Directive)
            const endLineIdx = parserState.lineIdx
            return new RstDirective(
                parserState.registrar,
                {
                    startLineIdx,
                    endLineIdx,
                },
                directiveChildren,
                directive,
                directiveInitContent,
                directiveConfig,
                rawBodyText,
            )
        } else {
            const children = parserState.parseBodyNodes(bodyIndentSize, RstNodeType.Directive, directiveChildren)
            const endLineIdx = parserState.lineIdx
            return new RstDirective(
                parserState.registrar,
                {
                    startLineIdx,
                    endLineIdx,
                },
                children,
                directive,
                directiveInitContent,
                directiveConfig,
                '',
            )
        }
    },
}
