import { RstNode, RstNodeSource, RstNodeType } from '../RstNode.js'
import { EnumeratedListType } from './EnumeratedListType.js'
import { ListItemNode } from './ListItemNode.js'

export const romanUpperRe = /(I+|[MDCLXVI]{2,})/
export const romanLowerRe = /(i+|[mdclxvi]{2,})/

export const enumeratedListRe = new RegExp(
    '^[ ]*' + // Whitespace at start
    '(' +
        '\\(?' + // Opening parenthesis
        '(' +
            '[0-9]+' + // Arabic
            '|' +
            '[A-Za-z]' + // Alphabet
            '|' +
            '#' + // Auto enumerator
            '|' +
            romanUpperRe.source + // Roman Numerals (uppercase)
            '|' +
            romanLowerRe.source + // Roman Numerals (lowercase)
        ')' +
        '[)\\.]' + // Closing parenthesis or period
        ' ' + // Space
    ')' +
    '([^\n]*)$', // Any char (except new line) to end of current line
)

export class EnumeratedListNode extends RstNode {
    type = RstNodeType.EnumeratedList

    constructor(
        readonly listType: EnumeratedListType,

        source: RstNodeSource,
        children: ReadonlyArray<Readonly<RstNode>> = [],
    ) {
        super(source, children)
    }

    override get label(): string {
        return `${this.type} "${this.listType}"`
    }

    override toExpectString(selfVarName: string): string {
        let str = ''

        str += `expect((${selfVarName} as EnumeratedListNode).listType).toBe(EnumeratedListType.${this.listType})`
        str += '\n' + super.toExpectString(selfVarName)

        for (let i = 0; i < this._children.length; i++) {
            const child = this._children[i] as ListItemNode
            str += '\n' + `expect((${selfVarName}.children[${i}] as ListItemNode).bullet).toBe('${child.bullet}')`
        }

        return str
    }
}
