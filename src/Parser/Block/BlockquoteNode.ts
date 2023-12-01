import { TextNode } from '../Inline/TextNode.js'
import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

export const blockquoteRe = /^([ ]+)([^\n]*)$/
export const blockquoteAttributonRe = /^([ ]+)(---?[ ])([^\n]*)$/

export class BlockquoteNode extends RstNode {
    type = RstNodeType.Blockquote

    constructor(
        source: RstNodeSource,
        children: Array<RstNode>,
        readonly indentSize: number,
    ) {
        super(source, children)
    }
}

export class BlockquoteAttributionNode extends RstNode {
    type = RstNodeType.BlockquoteAttribution

    constructor(
        source: RstNodeSource,
        origStr: string,
    ) {
        // TODO parse inline elements
        const textNode = new TextNode(source.startLineIdx, source.endLineIdx, source.startIdx, origStr)
        super(source, [textNode])
    }
}
