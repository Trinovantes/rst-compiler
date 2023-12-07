import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export class Text extends RstNode {
    type = RstNodeType.Text

    constructor(
        readonly origText: string,
        source: RstNodeSource,
    ) {
        super(source)
    }

    override toString(depth = 0): string {
        const childTab = '  '.repeat(depth + 1)
        let str = super.toString(depth)

        for (const line of this.origText.split('\n')) {
            str += childTab + `"${line}"\n`
        }

        return str
    }

    override toObject(): RstNodeObject {
        return {
            type: this.type,
            text: this.origText,
        }
    }

    override getTextContent(): string {
        return this.origText
    }
}
