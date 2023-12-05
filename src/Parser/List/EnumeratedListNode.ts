import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'
import { EnumeratedListType } from './EnumeratedListType.js'

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

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            listType: this.listType,
        }

        return root
    }
}
