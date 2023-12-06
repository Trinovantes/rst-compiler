export const enum RstNodeType {
    Document = 'Document',
    Section = 'Section',
    Transition = 'Transition',

    // ------------------------------------------------------------------------
    // Body elements
    // ------------------------------------------------------------------------

    Paragraph = 'Paragraph', // Generic fallback

    ListItem = 'ListItem', // <li>
    BulletList = 'BulletList', // <ul>
    EnumeratedList = 'EnumeratedList', // <ol>
    DefinitionList = 'DefinitionList', // <dl>
    DefinitionListItem = 'DefinitionListItem', // <dt> and <dd>
    FieldList = 'FieldList',
    FieldListItem = 'FieldListItem',
    OptionList = 'OptionList',

    LiteralBlock = 'LiteralBlock',
    LineBlock = 'LineBlock',
    Blockquote = 'Blockquote',
    BlockquoteAttribution = 'BlockquoteAttribution',
    DocktestBlock = 'DocktestBlock',

    Table = 'Table',

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

// For debug purposes
export type RstNodeSource = {
    startLineIdx: number
    endLineIdx: number // exclusive
}

// For testing
export type RstNodeObject = {
    type: RstNodeType
    text?: string
    meta?: Record<string, string | number | Array<string> | Array<number> | RstNodeObject | Array<RstNodeObject>>
    children?: Array<RstNodeObject>
}

export abstract class RstNode {
    abstract readonly type: RstNodeType

    constructor(
        readonly source: RstNodeSource,
        readonly children: ReadonlyArray<Readonly<RstNode>> = [],
    ) {}

    get isPlainTextContent(): boolean {
        return false
    }

    protected get label(): string {
        return this.type
    }

    toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        const start = this.source.startLineIdx + 1
        const end = this.source.endLineIdx + 1
        let str = selfTab + `[${this.label}] (${start}-${end})\n`

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
