import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'
import { ParagraphNode } from './ParagraphNode.js'

export const blockquoteRe = /^([ ]+)([^\n]*)$/

export function isBlockquoteAttribution(indent: string, node?: RstNode): node is ParagraphNode {
    if (!node) {
        return false
    }

    if (node.type !== RstNodeType.Paragraph) {
        return false
    }

    return new RegExp(`^${indent}(--|---)[ ]([^\n]*)`).test(node.getTextContent())
}

export class BlockquoteNode extends RstNode {
    type = RstNodeType.Blockquote

    constructor(
        source: RstNodeSource,
        children: Array<RstNode>,
        indent: string,
    ) {
        const lastChiid = children.at(-1)
        if (isBlockquoteAttribution(indent, lastChiid)) {
            children = [
                ...children.slice(0, children.length - 1),
                new BlockquoteAttributionNode(lastChiid),
            ]
        }

        super(source, children)
    }
}

export class BlockquoteAttributionNode extends RstNode {
    type = RstNodeType.BlockquoteAttribution

    constructor(paragraph: ParagraphNode) {
        super(paragraph.source, [...paragraph.children])
    }
}
