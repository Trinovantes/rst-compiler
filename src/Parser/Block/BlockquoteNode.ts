import { TextNode } from '../Inline/TextNode.js'
import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

export const blockquoteRe = /^([ ]+)([^\n]*)$/
export const blockquoteAttributonRe = /^([ ]+)(---?[ ]+)([^\n]*)$/

export class BlockquoteNode extends RstNode {
    type = RstNodeType.Blockquote
}

export class BlockquoteAttributionNode extends RstNode {
    type = RstNodeType.BlockquoteAttribution

    constructor(
        readonly origText: string,
        source: RstNodeSource,
    ) {
        // TODO parse inline elements
        const textNode = new TextNode(origText, source)
        super(source, [textNode])
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1
    }
}
