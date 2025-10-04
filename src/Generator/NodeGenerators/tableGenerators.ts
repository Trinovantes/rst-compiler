import { RstParagraph } from '../../RstNode/Block/Paragraph.ts'
import type { RstDirective } from '../../RstNode/ExplicitMarkup/Directive.ts'
import { RstNode } from '../../RstNode/RstNode.ts'
import { assertNode } from '../../utils/assertNode.ts'
import { parseCsv } from '../../utils/parseCsv.ts'
import { HtmlAttributeStore } from '../HtmlAttributeStore.ts'
import { createNodeGenerators } from '../RstGenerator.ts'
import { RstGeneratorError } from '../RstGeneratorError.ts'
import type { RstGeneratorState } from '../RstGeneratorState.ts'

// ----------------------------------------------------------------------------
// MARK: Table
// ----------------------------------------------------------------------------

export const tableGenerators = createNodeGenerators<'Table', [RstDirective?]>(
    'Table',

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

// ----------------------------------------------------------------------------
// MARK: ListTable
// ----------------------------------------------------------------------------

export const listTableGenerators = createNodeGenerators<'BulletList', [RstDirective]>(
    'BulletList',

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
// MARK: CsvTable
// ----------------------------------------------------------------------------

export const csvTableGenerators = createNodeGenerators<'Paragraph', [RstDirective]>(
    'Paragraph',

    (generatorState, node, directiveNode) => {
        const numHeadRows = parseInt(directiveNode.config?.getField('header-rows') ?? '0')
        const tableAlign = directiveNode.config?.getField('align') ?? null
        const tableWidth = directiveNode.config?.getField('width') ?? null
        const colWidths = getColWidths(generatorState, directiveNode, false)

        const explicitHeaderRows = parseCsv(directiveNode.config?.getField('header'))
        const csvRows = parseCsv(node.rawTextContent)
        const headRows = csvRows.slice(0, numHeadRows)
        const bodyRows = csvRows.slice(numHeadRows)
        const numColumns = Math.max(...csvRows.map((row) => row.length), explicitHeaderRows?.length ?? 0)

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

                if (explicitHeaderRows.length > 0 || headRows.length > 0) {
                    generatorState.writeLineHtmlTag('thead', null, () => {
                        for (const headRow of explicitHeaderRows) {
                            generateCsvTableRow(generatorState, headRow, numColumns, 'th', colWidths, tableAlign)
                        }
                        for (const headRow of headRows) {
                            generateCsvTableRow(generatorState, headRow, numColumns, 'th', colWidths, tableAlign)
                        }
                    })
                }

                if (bodyRows.length > 0) {
                    generatorState.writeLineHtmlTag('tbody', null, () => {
                        for (const bodyRow of bodyRows) {
                            generateCsvTableRow(generatorState, bodyRow, numColumns, 'td', colWidths, tableAlign)
                        }
                    })
                }
            })
        })
    },
)

// ----------------------------------------------------------------------------
// MARK: TableRow
// ----------------------------------------------------------------------------

export const tableRowGenerators = createNodeGenerators(
    'TableRow',

    (generatorState, node) => {
        throw new RstGeneratorError(generatorState, node, 'This should not be called directly')
    },

    (generatorState, node) => {
        generatorState.writeLineVisitor(() => {
            for (const cell of node.children) {
                generatorState.writeText('|')
                generatorState.visitNode(cell)
            }

            generatorState.writeText('|')
        })

        // Markdown requires header separator to be printed after first row to parse as table
        if (node.getMyIndexInParent() === 0) {
            generatorState.writeLineVisitor(() => {
                for (let i = 0; i < node.children.length; i++) {
                    generatorState.writeText('|')
                    generatorState.writeText(' --- ')
                }

                generatorState.writeText('|')
            })
        }
    },
)

// ----------------------------------------------------------------------------
// MARK: TableCell
// ----------------------------------------------------------------------------

export const tableCellGenerators = createNodeGenerators(
    'TableCell',

    (generatorState, node) => {
        throw new RstGeneratorError(generatorState, node, 'This should not be called directly')
    },

    (generatorState, node) => {
        const cellText = generatorState.getChildrenText(() => {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i]
                if (!(child instanceof RstParagraph)) {
                    throw new RstGeneratorError(generatorState, 'Cannot render non-paragraphs in Markdown tables')
                }
                if (i > 0) {
                    generatorState.writeText('<br>')
                }

                generatorState.visitNodes(child.children)
            }
        })

        generatorState.writeText(` ${cellText.replaceAll('\n', ' ')} `)
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
        assertNode(generatorState, table, 'Table')

        let totalWidth = 0
        const cellWidths = new Array<number>()

        for (const cell of table.children[0].children) {
            assertNode(generatorState, cell, 'TableCell')

            totalWidth += cell.characterWidth
            cellWidths.push(cell.characterWidth)
        }

        return cellWidths.map((width) => (width / totalWidth * 100).toString())
    }

    return rawWidths.split(' ')
}

function generateTableRows(generatorState: RstGeneratorState, rowNodes: ReadonlyArray<RstNode>, cellTag: 'th' | 'td', colWidths: Array<string>, tableAlign: string | null): void {
    for (const rowNode of rowNodes) {
        assertNode(generatorState, rowNode, 'TableRow')

        generatorState.writeLineHtmlTag('tr', rowNode, () => {
            for (const [idx, cellNode] of rowNode.children.entries()) {
                assertNode(generatorState, cellNode, 'TableCell')

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
        assertNode(generatorState, rowNode, 'BulletListItem', 1)

        const colList = rowNode.children[0]
        assertNode(generatorState, colList, 'BulletList')

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

function generateCsvTableRow(generatorState: RstGeneratorState, columns: Array<string>, numColumns: number, cellTag: 'th' | 'td', colWidths: Array<string>, tableAlign: string | null): void {
    for (let i = columns.length; i < numColumns; i++) {
        columns.push('')
    }

    generatorState.writeLineHtmlTag('tr', null, () => {
        for (let idx = 0; idx < columns.length; idx++) {
            const attrs = new HtmlAttributeStore()
            if (colWidths.length > 0) {
                attrs.append('style', getCssWidth(colWidths[idx]))
            }
            if (tableAlign) {
                attrs.append('style', `text-align:${tableAlign};`)
            }

            generatorState.writeLineHtmlTagWithAttr(cellTag, null, attrs, () => {
                generatorState.writeLine(columns[idx])
            })
        }
    })
}
