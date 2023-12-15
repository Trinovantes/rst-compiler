export const enum RstNodeType {
    Document = 'Document',
    Section = 'Section',
    Transition = 'Transition',

    // ------------------------------------------------------------------------
    // Body elements
    // ------------------------------------------------------------------------

    Paragraph = 'Paragraph', // Generic fallback

    BulletList = 'BulletList', // <ul>
    BulletListItem = 'BulletListItem', // <li>
    EnumeratedList = 'EnumeratedList', // <ol>
    DefinitionList = 'DefinitionList', // <dl>
    DefinitionListItem = 'DefinitionListItem', // <dt> and <dd>
    FieldList = 'FieldList',
    FieldListItem = 'FieldListItem',
    OptionList = 'OptionList',
    OptionListItem = 'OptionListItem',

    LiteralBlock = 'LiteralBlock',
    LineBlock = 'LineBlock',
    Blockquote = 'Blockquote',
    BlockquoteAttribution = 'BlockquoteAttribution',
    DocktestBlock = 'DocktestBlock',

    Table = 'Table',
    TableRow = 'TableRow',
    TableCell = 'TableCell',

    FootNote = 'FootNote',
    Citation = 'Citation',
    HyperLinkTarget = 'HyperLinkTarget',
    Directive = 'Directive',
    SubstitutionDef = 'SubstitutionDef',
    Comment = 'Comment',

    // ------------------------------------------------------------------------
    // Inline elements
    // ------------------------------------------------------------------------

    Text = 'Text',
}

// For debugging
export type RstNodeSource = {
    startLineIdx: number
    endLineIdx: number // exclusive
}

// For testing
export type RstNodeObject = {
    type: RstNodeType
    text?: string
    meta?: Record<string,
        string | Array<string> |
        number | Array<number> |
        boolean | Array<boolean> |
        RstNodeObject | Array<RstNodeObject> |
        Record<string, string | undefined> | Array<Record<string, string | undefined>>
    >
    children?: Array<RstNodeObject>
}

export abstract class RstNode {
    abstract readonly type: RstNodeType

    constructor(
        readonly source: RstNodeSource,
        readonly children: Array<RstNode> = [],
    ) {}

    get isPlainTextContent(): boolean {
        return false
    }

    toShortString(): string {
        return `${this.type} child:${this.children.length}`
    }

    toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        const start = this.source.startLineIdx + 1
        const end = this.source.endLineIdx + 1
        let str = selfTab + `[${this.toShortString()}] (line:${start}-${end})\n`

        for (const child of this.children) {
            str += child.toString(depth + 1)
        }

        return str
    }

    toObject(): RstNodeObject {
        const root: RstNodeObject = {
            type: this.type,
        }

        if (this.isPlainTextContent) {
            root.text = this.getTextContent()
        } else if (this.children.length > 0) {
            root.children = []

            for (const child of this.children) {
                root.children.push(child.toObject())
            }
        }

        return root
    }

    getTextContent(): string {
        let str = ''

        for (const child of this.children) {
            str += child.getTextContent()
        }

        return str
    }
}
