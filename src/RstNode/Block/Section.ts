import { RstNode, type RstNodeJson, type RstNodeObject, type RstNodeSource } from '../RstNode.js'
import type { RstNodeType } from '../RstNodeType.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { ContinuousText } from '../Inline/Text.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#sections
// ----------------------------------------------------------------------------

export type RstSectionData = {
    level: number
}

export class RstSection extends RstNode {
    protected readonly textNodes: ContinuousText
    readonly level: number

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        textNodes: ContinuousText = [],
        level: number,
    ) {
        super(registrar, source, textNodes)
        this.textNodes = textNodes
        this.level = level
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            level: this.level,
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstSectionData>

        root.data = {
            level: this.level,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstSectionData>): RstSection {
        const children = json.children.map((childJson) => registrar.reviveRstTextFromJson(childJson))
        return new RstSection(registrar, structuredClone(json.source), children, json.data.level)
    }

    override clone(registrar: RstNodeRegistrar): RstSection {
        const children = this.textNodes.map((child) => child.clone(registrar))
        return new RstSection(registrar, structuredClone(this.source), children, this.level)
    }

    override get nodeType(): RstNodeType {
        return 'Section'
    }

    override toShortString(): string {
        return `${super.toShortString()} level:${this.level}`
    }
}
