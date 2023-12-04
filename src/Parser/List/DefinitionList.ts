import { TextNode } from '../Inline/TextNode.js'
import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'

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
        const termStartLineIdx = source.startLineIdx
        const termEndLineIdx = source.startLineIdx + 1
        const term = new TextNode(termStartLineIdx, termEndLineIdx, source.startIdx, termText)

        let startIdx = term.source.endIdx
        const classifiers = new Array<TextNode>()
        for (const classiferText of classifiersText) {
            startIdx += ' : '.length
            classifiers.push(new TextNode(termStartLineIdx, termEndLineIdx, startIdx, classiferText))
            startIdx += classiferText.length
        }

        super(source)
        this.term = term
        this.classifiers = classifiers
        this.defBodyNodes = defBodyNodes
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        const start = this.source.startLineIdx + 1
        const end = this.source.endLineIdx + 1
        let str = selfTab + `[${this.label}] startIdx:${this.source.startIdx} endIdx:${this.source.endIdx} (${this.length}) line:${start}-${end}\n`

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

    override toExpectString(selfVarName?: string): string {
        let str = ''

        str += `expect((${selfVarName} as DefinitionListItemNode).term.getTextContent()).toBe('${this.term.origText}')`

        str += '\n' + `expect((${selfVarName} as DefinitionListItemNode).classifiers.length).toBe(${this.classifiers.length})`
        for (let i = 0; i < this.classifiers.length; i++) {
            str += '\n' + `expect((${selfVarName} as DefinitionListItemNode).classifiers[${i}].getTextContent()).toBe('${this.classifiers[i].origText}')`
        }

        str += '\n' + `expect((${selfVarName} as DefinitionListItemNode).defBodyNodes.length).toBe(${this.defBodyNodes.length})`
        for (let i = 0; i < this.defBodyNodes.length; i++) {
            str += '\n' + `expect((${selfVarName} as DefinitionListItemNode).defBodyNodes[${i}].type).toBe(RstNodeType.${this.defBodyNodes[i].type})`
        }
        for (let i = 0; i < this.defBodyNodes.length; i++) {
            str += '\n' + this.defBodyNodes[i].toExpectString(`(${selfVarName} as DefinitionListItemNode).defBodyNodes[${i}]`)
        }

        return str
    }
}
