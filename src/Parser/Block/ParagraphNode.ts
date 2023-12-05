import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'
import { TextNode } from '../Inline/TextNode.js'

export class ParagraphNode extends RstNode {
    type = RstNodeType.Paragraph

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
