import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'
import { Text } from '../Inline/Text.js'

export class Section extends RstNode {
    type = RstNodeType.Section

    constructor(
        readonly level: number,
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

    override toShortString(): string {
        return `${super.toShortString()} level:${this.level}`
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            level: this.level,
        }

        return root
    }
}
