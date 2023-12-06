import { TextNode } from '../Inline/TextNode.js'
import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

export class ParagraphNode extends RstNode {
    type = RstNodeType.Paragraph

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
