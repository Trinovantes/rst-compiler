import { RstNode, type RstNodeSource, type RstNodeJson, type RstNodeObject } from '../RstNode.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstTableCellData = {
    rowSpan: number
    colSpan: number
    characterWidth: number
}

export class RstTableCell extends RstNode {
    readonly rowSpan: number
    readonly colSpan: number
    readonly characterWidth: number

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        rowSpan: number,
        colSpan: number,
        characterWidth: number,
    ) {
        if (rowSpan < 1 || colSpan < 1) {
            throw new Error(`Invalid colspan:${colSpan} rowspan:${rowSpan}`)
        }

        super(registrar, source, children)
        this.rowSpan = rowSpan
        this.colSpan = colSpan
        this.characterWidth = characterWidth
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        if (this.rowSpan !== 1 || this.colSpan !== 1) {
            root.data = {
                rowSpan: this.rowSpan,
                colSpan: this.colSpan,
            }
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstTableCellData>

        root.data = {
            rowSpan: this.rowSpan,
            colSpan: this.colSpan,
            characterWidth: this.characterWidth,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTableCellData>): RstTableCell {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstTableCell(registrar, structuredClone(json.source), children, json.data.rowSpan, json.data.colSpan, json.data.characterWidth)
    }

    override clone(registrar: RstNodeRegistrar): RstTableCell {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstTableCell(registrar, structuredClone(this.source), children, this.rowSpan, this.colSpan, this.characterWidth)
    }

    override get nodeType(): RstNodeType {
        return 'TableCell'
    }

    override toShortString(): string {
        return `${super.toShortString()} rowSpan:${this.rowSpan} colSpan:${this.colSpan}`
    }
}
