import { RstNode, RstNodeObject, RstNodeSource, RstNodeType } from '../RstNode.js'

export class Table extends RstNode {
    type = RstNodeType.Table

    constructor(
        readonly headRows: Array<TableRow>,
        readonly bodyRows: Array<TableRow>,

        source: RstNodeSource,
    ) {
        super(source)
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        const start = this.source.startLineIdx + 1
        const end = this.source.endLineIdx + 1
        let str = selfTab + `[${this.label}] (${start}-${end})\n`

        str += selfTab + `  (HeadRows len:${this.headRows.length})` + '\n'
        for (const row of this.headRows) {
            str += row.toString(depth + 2)
        }

        str += selfTab + `  (BodyRows len:${this.bodyRows.length})` + '\n'
        for (const row of this.bodyRows) {
            str += row.toString(depth + 2)
        }

        return str
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            headRows: this.headRows.map((row) => row.toObject()),
            bodyRows: this.bodyRows.map((row) => row.toObject()),
        }

        return root
    }
}

export class TableRow extends RstNode {
    type = RstNodeType.TableRow
}

export class TableCell extends RstNode {
    type = RstNodeType.TableCell

    constructor(
        readonly rowSpan: number,
        readonly colSpan: number,

        source: RstNodeSource,
        children: Array<RstNode>,
    ) {
        super(source, children)
    }

    override get isPlainTextContent(): boolean {
        return this.children.length === 1 && this.children[0].isPlainTextContent
    }

    protected override get label(): string {
        return `${this.type} rowSpan:${this.rowSpan} colSpan:${this.colSpan}`
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.meta = {
            rowSpan: this.rowSpan,
            colSpan: this.colSpan,
        }

        return root
    }
}
