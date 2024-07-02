import { RstNode, RstNodeJson, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstTableCell } from './TableCell.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { RstParagraph } from '../Block/Paragraph.js'
import { RstDirective } from '../ExplicitMarkup/Directive.js'
import { RstGeneratorState } from '@/Generator/RstGeneratorState.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import { RstGeneratorError } from '@/Generator/RstGeneratorError.js'
import { assertNode } from '@/utils/assertNode.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstTableData = {
    headRows: Array<RstNodeJson>
    bodyRows: Array<RstNodeJson>
}

export class RstTable extends RstNode {
    readonly isComplexTable: boolean

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        readonly headRows: ReadonlyArray<RstNode>,
        readonly bodyRows: ReadonlyArray<RstNode>,
    ) {
        super(registrar, source, [...headRows, ...bodyRows])

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
        return RstNodeType.Table
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const tableGenerators = createNodeGenerators<RstNodeType.Table, [RstDirective?]>(
    RstNodeType.Table,

    (generatorState, node, directiveNode) => {
        const tableAlign = directiveNode?.config?.getField('align') ?? null
        const tableWidth = directiveNode?.config?.getField('width') ?? null
        const colWidths = getColWidths(generatorState, directiveNode, true)

        const tableAttrs = new HtmlAttributeStore()
        if (tableWidth) {
            tableAttrs.set('style', getCssWidth(tableWidth))
        }

        generatorState.useNoLineBreaksBetweenBlocks(() => {
            generatorState.writeLineHtmlTagWithAttr('table', node, tableAttrs, () => {
                if (directiveNode?.initContent) {
                    generatorState.writeLineHtmlTag('caption', null, () => {
                        generatorState.visitNodes(directiveNode.initContent)
                    })
                }

                if (node.headRows.length > 0) {
                    generatorState.writeLineHtmlTag('thead', null, () => {
                        generateTableRows(generatorState, node.headRows, 'th', colWidths, tableAlign)
                    })
                }

                if (node.bodyRows.length > 0) {
                    generatorState.writeLineHtmlTag('tbody', null, () => {
                        generateTableRows(generatorState, node.bodyRows, 'td', colWidths, tableAlign)
                    })
                }
            })
        })
    },

    (generatorState, node, directiveNode) => {
        if (directiveNode || node.isComplexTable) {
            generatorState.useForcedHtmlMode(() => {
                tableGenerators.htmlGenerator.generate(generatorState, node, directiveNode)
            })
        } else {
            generatorState.useNoLineBreaksBetweenBlocks(() => {
                generatorState.visitNodes(node.children)
            })
        }
    },
)

export const listTableGenerators = createNodeGenerators<RstNodeType.BulletList, [RstDirective]>(
    RstNodeType.BulletList,

    (generatorState, node, directiveNode) => {
        const numHeadRows = parseInt(directiveNode.config?.getField('header-rows') ?? '0')
        const tableAlign = directiveNode.config?.getField('align') ?? null
        const tableWidth = directiveNode.config?.getField('width') ?? null
        const colWidths = getColWidths(generatorState, directiveNode, false)

        const headRows = node.children.slice(0, numHeadRows)
        const bodyRows = node.children.slice(numHeadRows)

        const tableAttrs = new HtmlAttributeStore()
        if (tableWidth) {
            tableAttrs.set('style', getCssWidth(tableWidth))
        }

        generatorState.useNoLineBreaksBetweenBlocks(() => {
            generatorState.writeLineHtmlTagWithAttr('table', node, tableAttrs, () => {
                if (directiveNode.initContent.length > 0) {
                    generatorState.writeLineHtmlTag('caption', null, () => {
                        generatorState.visitNodes(directiveNode.initContent)
                    })
                }

                if (headRows.length > 0) {
                    generatorState.writeLineHtmlTag('thead', null, () => {
                        generateListTableRows(generatorState, headRows, 'th', colWidths, tableAlign)
                    })
                }

                if (bodyRows.length > 0) {
                    generatorState.writeLineHtmlTag('tbody', null, () => {
                        generateListTableRows(generatorState, bodyRows, 'td', colWidths, tableAlign)
                    })
                }
            })
        })
    },
)

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getCssWidth(str: string): string {
    const numVal = parseInt(str)
    if (isNaN(numVal)) {
        return `width:${str};`
    } else {
        return `width:${numVal}%;`
    }
}

function getColWidths(generatorState: RstGeneratorState, directiveNode: RstDirective | undefined, allowGridValue: boolean): Array<string> {
    const rawWidths = directiveNode?.config?.getField('widths')
    if (!rawWidths || rawWidths === 'auto') {
        return []
    }

    if (allowGridValue && rawWidths === 'grid') {
        const table = directiveNode?.children.at(0)
        assertNode(generatorState, table, RstNodeType.Table)

        let totalWidth = 0
        const cellWidths = new Array<number>()

        for (const cell of table.children[0].children) {
            assertNode(generatorState, cell, RstNodeType.TableCell)

            totalWidth += cell.characterWidth
            cellWidths.push(cell.characterWidth)
        }

        return cellWidths.map((width) => (width / totalWidth * 100).toString())
    }

    return rawWidths.split(' ')
}

function generateTableRows(generatorState: RstGeneratorState, rowNodes: ReadonlyArray<RstNode>, cellTag: 'th' | 'td', colWidths: Array<string>, tableAlign: string | null): void {
    for (const rowNode of rowNodes) {
        assertNode(generatorState, rowNode, RstNodeType.TableRow)

        generatorState.writeLineHtmlTag('tr', rowNode, () => {
            for (const [idx, cellNode] of rowNode.children.entries()) {
                assertNode(generatorState, cellNode, RstNodeType.TableCell)

                const attrs = new HtmlAttributeStore()

                if (cellNode.rowSpan > 1) {
                    attrs.set('rowspan', cellNode.rowSpan.toString())
                }
                if (cellNode.colSpan > 1) {
                    attrs.set('colspan', cellNode.colSpan.toString())
                }
                if (colWidths.length > 0) {
                    attrs.append('style', getCssWidth(colWidths[idx]))
                }
                if (tableAlign) {
                    attrs.append('style', `text-align:${tableAlign};`)
                }

                generatorState.writeLineHtmlTagWithAttr(cellTag, cellNode, attrs, () => {
                    generatorState.visitNodes(cellNode.children)
                })
            }
        })
    }
}

function generateListTableRows(generatorState: RstGeneratorState, rowNodes: ReadonlyArray<RstNode>, cellTag: 'th' | 'td', colWidths: Array<string>, tableAlign: string | null): void {
    for (const rowNode of rowNodes) {
        assertNode(generatorState, rowNode, RstNodeType.BulletListItem, 1)

        const colList = rowNode.children[0]
        assertNode(generatorState, colList, RstNodeType.BulletList)

        if (colWidths.length > 0 && colList.children.length !== colWidths.length) {
            throw new RstGeneratorError(generatorState, `Expected ${colList.children.length} widths but only got ${colWidths.length}`)
        }

        generatorState.writeLineHtmlTag('tr', colList, () => {
            for (const [idx, cellNode] of colList.children.entries()) {
                const attrs = new HtmlAttributeStore()
                if (colWidths.length > 0) {
                    attrs.append('style', getCssWidth(colWidths[idx]))
                }
                if (tableAlign) {
                    attrs.append('style', `text-align:${tableAlign};`)
                }

                generatorState.writeLineHtmlTagWithAttr(cellTag, cellNode, attrs, () => {
                    generatorState.visitNodes(cellNode.children)
                })
            }
        })
    }
}
