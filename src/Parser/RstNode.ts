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
    startIdx: number
    endIdx: number // exclusive
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
        public readonly source: RstNodeSource,
        protected readonly _children: ReadonlyArray<Readonly<RstNode>> = [],
    ) {}

    get length(): number {
        return this.source.endIdx - this.source.startIdx
    }

    get children(): ReadonlyArray<Readonly<RstNode>> {
        return this._children
    }

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
        let str = selfTab + `[${this.label}] startIdx:${this.source.startIdx} endIdx:${this.source.endIdx} (${this.length}) line:${start}-${end}\n`

        for (const child of this._children) {
            str += child.toString(depth + 1)
        }

        return str
    }

    toObject(omitChildrenIfPlainText = false): RstNodeObject {
        const root: RstNodeObject = {
            type: this.type,
        }

        if (omitChildrenIfPlainText && this.isPlainTextContent) {
            root.text = this.getTextContent()
        } else if (this.children.length > 0) {
            root.children = []

            for (const child of this._children) {
                root.children.push(child.toObject())
            }
        }

        return root
    }

    getTextContent(): string {
        let str = ''

        for (const child of this._children) {
            str += child.getTextContent()
        }

        return str
    }
}
