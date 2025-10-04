import { RstNode, type RstNodeJson, type RstNodeSource } from '../RstNode.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'
import type { ContinuousText } from '../Inline/Text.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#line-blocks
// ----------------------------------------------------------------------------

export class RstLineBlock extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstLineBlock {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstLineBlock(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstLineBlock {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstLineBlock(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'LineBlock'
    }
}

export class RstLineBlockLine extends RstNode {
    protected readonly textNodes: ContinuousText

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        textNodes: ContinuousText = [],
    ) {
        super(registrar, source, textNodes)
        this.textNodes = textNodes
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstLineBlockLine {
        const children = json.children.map((childJson) => registrar.reviveRstTextFromJson(childJson))
        return new RstLineBlockLine(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstLineBlockLine {
        const children = this.textNodes.map((child) => child.clone(registrar))
        return new RstLineBlockLine(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'LineBlockLine'
    }
}
