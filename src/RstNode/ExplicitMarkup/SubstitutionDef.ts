import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { removeEscapeChar } from '@/utils/removeEscapeChar.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstFieldList, fieldListParser } from '../List/FieldList.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

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
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        private readonly _rawNeedle: string,
        private readonly _rawDirective: string,
        private readonly _initContent: ReadonlyArray<RstNode>, // Content on first line of directive
        private readonly _config: RstFieldList | null, // FieldList that specifies the Directive's settings
    ) {
        super(registrar, source, children)
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
        return RstNodeType.SubstitutionDef
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

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const substitutionDefRe = new RegExp(
    '^ *.. +' +
    '\\|(?<needle>.+)\\| ' +
    '(?<directive>\\S+)' +
    '(?<!\\\\)::' +
    '(?: (?<firstLineText>.*))?' +
    '$',
)

export const substitutionDefParser: RstNodeParser<RstNodeType.SubstitutionDef> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        const firstLineMatches = parserState.peekTest(substitutionDefRe)
        if (!firstLineMatches) {
            return null
        }

        // Consume first line that we've already peeked at and tested
        parserState.consume()

        const needle = firstLineMatches.groups?.needle ?? ''
        const directive = firstLineMatches.groups?.directive ?? ''
        const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
        const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
        const initContent = parserState.parseInitContent(bodyIndentSize, firstLineText, startLineIdx)
        const directiveConfig = fieldListParser.parse(parserState, bodyIndentSize, RstNodeType.SubstitutionDef)

        const directiveInitContent = directive === 'image'
            ? initContent
            : []
        const directiveChildren = directive === 'image'
            ? []
            : initContent
        const children = parserState.parseBodyNodes(bodyIndentSize, RstNodeType.SubstitutionDef, directiveChildren)

        const endLineIdx = parserState.lineIdx
        return new RstSubstitutionDef(
            parserState.registrar,
            {
                startLineIdx,
                endLineIdx,
            },
            children,
            needle,
            directive,
            directiveInitContent,
            directiveConfig,
        )
    },
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const substitutionDefGenerators = createNodeGenerators(
    RstNodeType.SubstitutionDef,

    (generatorState, node) => {
        const replacementText = generatorState.getChildrenText(() => {
            generatorState.writeLine(node.toShortString())
            generatorState.useNoCommentMarkup(() => {
                generatorState.useNoLineBreaksBetweenBlocks(() => {
                    generatorState.visitNodes(node.children)
                })
            })
        })

        generatorState.writeLineHtmlComment(replacementText)
    },

    (generatorState, node) => {
        const replacementText = generatorState.getChildrenText(() => {
            generatorState.writeLine(node.toShortString())
            generatorState.useNoCommentMarkup(() => {
                generatorState.useNoLineBreaksBetweenBlocks(() => {
                    generatorState.visitNodes(node.children)
                })
            })
        })

        generatorState.writeLineMdComment(replacementText)
    },
)
