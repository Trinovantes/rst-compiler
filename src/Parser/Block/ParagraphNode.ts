import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'
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

    override toExpectString(selfVarName: string): string {
        let str = ''

        str += `expect(${selfVarName}.getTextContent()).toBe('${this.getTextContent()}')`
        str += '\n' + super.toExpectString(selfVarName)

        return str
    }
}
