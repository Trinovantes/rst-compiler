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

    override get label(): string {
        return `${this.type}:h${this.level}`
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            level: this.level,
        }

        return root
    }
}
