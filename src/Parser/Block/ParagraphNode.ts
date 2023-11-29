import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'
import { TextNode } from '../Inline/TextNode.js'

export class ParagraphNode extends RstNode {
    type = RstNodeType.Paragraph

    constructor(
        source: RstNodeSource,
        origStr: string,
    ) {
        // TODO parse inline elements
        const textNode = new TextNode(source.startLineIdx, source.endLineIdx, source.startIdx, origStr)
        super(source, [textNode])
    }
}
