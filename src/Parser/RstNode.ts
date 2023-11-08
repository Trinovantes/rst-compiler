export const enum RstNodeType {
    Document = 'Document', // Root
    Paragraph = 'Paragraph', // Generic fallback for all texts
    Text = 'Text', // Inline text

    Section = 'Section',
    Directive = 'Directive',
    Table = 'Table',

    BulletList = 'BulletList', // <ul>
    EnumeratedList = 'EnumeratedList', // <ol>
    DefinitionList = 'DefinitionList', // <dl>
    ListItem = 'ListItem',

    SubstitutionDef = 'SubstitutionDef',
}

export abstract class RstNode {
    abstract readonly type: RstNodeType

    // eslint-disable-next-line no-use-before-define
    protected parent: RstNode | null

    constructor(
        readonly startIdx: number,
        readonly endIdx: number, // exclusive
        readonly startLine: number,
        readonly endLine: number, // exclusive
        protected readonly _children = new Array<RstNode>(),
    ) {
        for (const child of this._children) {
            child.parent = this
        }

        this.parent = null
    }

    get length(): number {
        return this.endIdx - this.startIdx
    }

    protected get label(): string {
        return this.type
    }

    toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        const start = this.startLine + 1
        const end = this.endLine + 1
        let str = selfTab + `[${this.label}] startIdx:${this.startIdx} endIdx:${this.endIdx} (${this.length}) line:${start}-${end}\n`

        for (const child of this._children) {
            str += child.toString(depth + 1)
        }

        return str
    }
}
