import { RstNode, type RstNodeJson, type RstNodeSource } from '../RstNode.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'
import type { ContinuousText } from '../Inline/Text.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
// ----------------------------------------------------------------------------

export class RstBlockquoteAttribution extends RstNode {
    protected readonly textNodes: ContinuousText

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        textNodes: ContinuousText = [],
    ) {
        super(registrar, source, textNodes)
        this.textNodes = textNodes
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstBlockquoteAttribution {
        const children = json.children.map((childJson) => registrar.reviveRstTextFromJson(childJson))
        return new RstBlockquoteAttribution(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstBlockquoteAttribution {
        const children = this.textNodes.map((child) => child.clone(registrar))
        return new RstBlockquoteAttribution(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'BlockquoteAttribution'
    }
}
