import { RstNode, RstNodeType } from '../RstNode.js'

export class TextNode extends RstNode {
    type = RstNodeType.Text

    constructor(
        startLineIdx: number,
        endLineIdx: number,
        startIdx: number,
        readonly origText: string,
    ) {
        const endIdx = startIdx + origText.length
        super({ startLineIdx, endLineIdx, startIdx, endIdx })
    }

    override toString(depth = 0): string {
        const childTab = '  '.repeat(depth + 1)
        let str = super.toString(depth)

        for (const line of this.origText.split('\n')) {
            str += childTab + `"${line}"\n`
        }

        return str
    }

    override getTextContent(): string {
        return this.origText
    }
}
