import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

export class Comment extends RstNode {
    type = RstNodeType.Comment

    constructor(
        readonly text: string,

        source: RstNodeSource,
    ) {
        super(source)
    }

    override get isPlainTextContent(): boolean {
        return true
    }

    override getTextContent(): string {
        return this.text
    }
}
