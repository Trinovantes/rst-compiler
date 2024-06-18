import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstParserState } from '@/Parser/RstParserState.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { removeEscapeChar } from '@/utils/removeEscapeChar.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { emailRe, urlRe } from '@/utils/parseEmbededRef.js'

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
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        private readonly _rawLabel: string,
        private readonly _rawTarget: string,
    ) {
        super(registrar, source)
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

    override toJson(): RstNodeJson {
        const root = super.toJson() as RstNodeJson<RstHyperlinkTargetData>

        root.data = {
            rawLabel: this._rawLabel,
            rawTarget: this._rawTarget,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstHyperlinkTargetData>): RstHyperlinkTarget {
        return new RstHyperlinkTarget(registrar, structuredClone(json.source), json.data.rawLabel, json.data.rawTarget)
    }

    override clone(registrar: RstNodeRegistrar): RstHyperlinkTarget {
        return new RstHyperlinkTarget(registrar, structuredClone(this.source), this._rawLabel, this._rawTarget)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.HyperlinkTarget
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

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const explicitHyperlinkTargetRe = new RegExp(
    '^ *.. +' +
    '_' +
        '(?:' +
            '(?<anonymousName>_)' +
            '|' +
            '`(?<phraseName>(?:\\`|[^`])+)`' + // Backtick wraps any character except backtick (unless escaped backtick)
            '|' +
            '(?<linkName>(?:\\:|[^:])+)' + // Any non-colon character except colon (unless escaped colon)
        ')' +
    '(?<!\\\\):' + // Colon cannot be preceded by escape slash
    '(?: (?<firstLineText>.*))?' +
    '$',
)

const anonymousHyperlinkTargetRe = /^__(?: (?<hyperlinkTarget>.+))?$/

export const hyperlinkTargetParser: RstNodeParser<RstNodeType.HyperlinkTarget> = {
    parse: (parserState, indentSize) => {
        return parseExplicitTarget(parserState, indentSize) ?? parseAnonymousTarget(parserState, indentSize)
    },
}

function parseExplicitTarget(parserState: RstParserState, indentSize: number): RstHyperlinkTarget | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(explicitHyperlinkTargetRe)
    if (!firstLineMatches) {
        return null
    }

    const rawLabel = firstLineMatches.groups?.anonymousName ?? firstLineMatches.groups?.phraseName ?? firstLineMatches.groups?.linkName
    if (!rawLabel) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const firstLineText = firstLineMatches.groups?.firstLineText ?? ''
    const bodyIndentSize = parserState.peekNestedIndentSize(indentSize)
    const linkText = parserState.parseInitContentText(bodyIndentSize, firstLineText, false)

    const endLineIdx = parserState.lineIdx
    return new RstHyperlinkTarget(
        parserState.registrar,
        {
            startLineIdx,
            endLineIdx,
        },
        rawLabel,
        linkText,
    )
}

function parseAnonymousTarget(parserState: RstParserState, indentSize: number): RstHyperlinkTarget | null {
    const startLineIdx = parserState.lineIdx

    if (!parserState.peekIsIndented(indentSize)) {
        return null
    }

    const firstLineMatches = parserState.peekTest(anonymousHyperlinkTargetRe)
    if (!firstLineMatches) {
        return null
    }

    // Consume first line that we've already peeked at and tested
    parserState.consume()

    const hyperlinkTarget = firstLineMatches.groups?.hyperlinkTarget ?? ''

    const endLineIdx = parserState.lineIdx
    return new RstHyperlinkTarget(
        parserState.registrar,
        {
            startLineIdx,
            endLineIdx,
        },
        '_',
        hyperlinkTarget,
    )
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const hyperlinkTargetGenerators = createNodeGenerators(
    RstNodeType.HyperlinkTarget,

    (generatorState, node) => {
        const resolvedUrl = generatorState.resolveNodeToUrl(node)
        generatorState.writeLineHtmlComment(`${node.toShortString()} resolvedUrl:"${resolvedUrl}"`)
    },

    (generatorState, node) => {
        const resolvedUrl = generatorState.resolveNodeToUrl(node)
        generatorState.writeLineMdComment(`${node.toShortString()} resolvedUrl:"${resolvedUrl}"`)
    },
)
