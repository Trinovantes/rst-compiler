import { TextNode } from '../Inline/TextNode.js'
import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export const blockquoteRe = /^([ ]+)([^\n]*)$/
export const blockquoteAttributonRe = /^([ ]+)(---?[ ]+)([^\n]*)$/

export class BlockquoteNode extends RstNode {
    type = RstNodeType.Blockquote
}

export class BlockquoteAttributionNode extends RstNode {
    type = RstNodeType.BlockquoteAttribution

    constructor(
        source: RstNodeSource,
        text: string,
    ) {
        // TODO parse inline elements
        const textNode = new TextNode(source.startLineIdx, source.endLineIdx, source.startIdx, text)
        super(source, [textNode])
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1
    }

    override toObject(): RstNodeObject {
        return super.toObject(true)
    }
}
