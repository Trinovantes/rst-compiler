import { TextNode } from '../Inline/TextNode.js'
import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export const definitionListRe = /^[ ]*([^\n]+)$/

export class DefinitionListNode extends RstNode {
    type = RstNodeType.DefinitionList
}

export class DefinitionListItemNode extends RstNode {
    type = RstNodeType.DefinitionListItem

    readonly term: TextNode
    readonly classifiers: Array<TextNode>
    readonly defBodyNodes: Array<RstNode>

    constructor(
        termText: string,
        classifiersText: Array<string>,
        defBodyNodes: Array<RstNode>,

        source: RstNodeSource,
    ) {
        super(source)

        const startLineIdx = source.startLineIdx
        const endLineIdx = source.startLineIdx + 1

        this.term = new TextNode(termText, { startLineIdx, endLineIdx })
        this.classifiers = classifiersText.map((text) => new TextNode(text, { startLineIdx, endLineIdx }))
        this.defBodyNodes = defBodyNodes
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        const start = this.source.startLineIdx + 1
        const end = this.source.endLineIdx + 1
        let str = selfTab + `[${this.label}] (${start}-${end})\n`

        str += selfTab + '  (Term)' + '\n'
        str += this.term.toString(depth + 2)

        str += selfTab + `  (Classifiers len:${this.classifiers.length})` + '\n'
        for (const classifier of this.classifiers) {
            str += classifier.toString(depth + 2)
        }

        str += selfTab + '  (Definition)' + '\n'
        for (const defBody of this.defBodyNodes) {
            str += defBody.toString(depth + 2)
        }

        return str
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            term: this.term.getTextContent(),
            classifiers: this.classifiers.map((classifier) => classifier.getTextContent()),
            definition: this.defBodyNodes.map((bodyNode) => bodyNode.toObject()),
        }

        return root
    }
}
