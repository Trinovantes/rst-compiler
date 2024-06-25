import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { removeEscapeChar } from '@/utils/removeEscapeChar.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstTextData = {
    rawText: string
}

export class RstText extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        protected readonly rawText: string,
    ) {
        super(registrar, source)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()
        root.text = this.textContent
        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstTextData>

        root.data = {
            rawText: this.rawText,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTextData>): RstText {
        return new RstText(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstText {
        return new RstText(registrar, structuredClone(this.source), this.rawText)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.Text
    }

    override get isInlineNode(): boolean {
        return true
    }

    override get isTextContentBasic(): boolean {
        // Only this parent class is plaintext (e.g. Text that subclasses this should not be considered plaintext)
        return this.nodeType === RstNodeType.Text
    }

    override get textContent(): string {
        return removeEscapeChar(this.rawText)
    }

    override get rawTextContent(): string {
        return this.rawText
    }

    override toShortString(): string {
        return `${super.toShortString()} len:${this.textContent.length}`
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)
        const childTab = '  '.repeat(depth + 1)

        let str = selfTab + `[${this.toShortString()}] (${this.lineNums})\n`
        for (const line of this.textContent.split('\n')) {
            str += childTab + `"${line}"\n`
        }

        return str
    }
}

export type ContinuousText = Array<RstText>

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const textGenerators = createNodeGenerators(
    RstNodeType.Text,

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(sanitizeHtml(node.textContent))
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(sanitizeHtml(node.textContent))
    },
)
