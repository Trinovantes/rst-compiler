import { Text } from '../Inline/Text.js'
import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

export class Paragraph extends RstNode {
    type = RstNodeType.Paragraph

    constructor(
        readonly origText: string,
        source: RstNodeSource,
    ) {
        // TODO parse inline elements
        const textNode = new Text(origText, source)
        super(source, [textNode])
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1
    }
}
