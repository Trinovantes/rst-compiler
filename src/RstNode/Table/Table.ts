import { RstNode, type RstNodeJson, type RstNodeSource } from '../RstNode.ts'
import { RstTableCell } from './TableCell.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'
import { RstParagraph } from '../Block/Paragraph.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstTableData = {
    headRows: Array<RstNodeJson>
    bodyRows: Array<RstNodeJson>
}

export class RstTable extends RstNode {
    readonly headRows: ReadonlyArray<RstNode>
    readonly bodyRows: ReadonlyArray<RstNode>
    readonly isComplexTable: boolean

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        headRows: ReadonlyArray<RstNode>,
        bodyRows: ReadonlyArray<RstNode>,
    ) {
        super(registrar, source, [...headRows, ...bodyRows])
        this.headRows = headRows
        this.bodyRows = bodyRows

        const hasHeaderRow = headRows.length === 1
        const hasSpanningCells = this.hasChild((child) => child instanceof RstTableCell && (child.colSpan > 1 || child.rowSpan > 1))
        const hasNonParagraphCellContent = this.hasChild((child) => child instanceof RstTableCell && child.hasChild((cellChild) => !cellChild.isInlineNode && !(cellChild instanceof RstParagraph)))

        this.isComplexTable = !hasHeaderRow || hasSpanningCells || hasNonParagraphCellContent
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstTableData>

        root.data = {
            headRows: this.headRows.map((child) => child.toJSON()),
            bodyRows: this.bodyRows.map((child) => child.toJSON()),
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTableData>): RstTable {
        const headRows = json.data.headRows.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        const bodyRows = json.data.bodyRows.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstTable(registrar, structuredClone(json.source), headRows, bodyRows)
    }

    override clone(registrar: RstNodeRegistrar): RstTable {
        const headRows = this.headRows.map((row) => row.clone(registrar))
        const bodyRows = this.bodyRows.map((row) => row.clone(registrar))
        return new RstTable(registrar, structuredClone(this.source), headRows, bodyRows)
    }

    override get nodeType(): RstNodeType {
        return 'Table'
    }
}
