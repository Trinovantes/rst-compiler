import type { RstNodeParser } from '../RstParser.ts'
import { RstTable } from '../../RstNode/Table/Table.ts'
import { RstTableCell } from '../../RstNode/Table/TableCell.ts'
import { RstTableRow } from '../../RstNode/Table/TableRow.ts'
import { RstParserError } from '../RstParserError.ts'

// ----------------------------------------------------------------------------
// MARK: Simple Parser
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#simple-tables
// ----------------------------------------------------------------------------

const simpleTableRe        = /^([ ]*)=+([ ]+[=]+)+$/
const simpleTableColSpanRe = /^([ ]*)-[ -]*$/

export const tableSimpleParser: RstNodeParser<'Table'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }

        if (!parserState.peekTest(simpleTableRe)) {
            return null
        }

        // --------------------------------------------------------------------
        // Step 1
        //
        // Collect all lines of the table into an array of strings for easy traversal and indexing
        // This is slightly more tricky than grid table since simple table allows linebreaks inside the table
        //
        // 1. Keep consuming until we've matched 1 table header followed by blank line (bottom border)
        // 2. Otherwise keep consuming until we've matched 2 table headers (header separator + bottom border)
        // 3. Throw error if we've reached end of input (malformed table)
        // --------------------------------------------------------------------

        const tableLines = new Array<string>()
        tableLines.push(parserState.consume().str.substring(indentSize)) // Top border

        let numSeparatorMatched = 0
        while (true) {
            if (!parserState.canConsume()) {
                throw new RstParserError(parserState, 'Reached end of input before finding simple table bottom border')
            }

            const isSeparator = parserState.peekTest(simpleTableRe)
            if (isSeparator) {
                numSeparatorMatched++
            }

            const line = parserState.consume()
            tableLines.push(line.str.substring(indentSize))

            // Found both header separator and bottom border
            if (numSeparatorMatched === 2) {
                break
            }

            // Found bottom border
            if (isSeparator && (parserState.peekIsNewLine() || !parserState.canConsume())) {
                break
            }
        }

        let headSeparatorLocation = -1
        for (let i = 1; i < tableLines.length - 1; i++) {
            if (simpleTableRe.test(tableLines[i])) {
                headSeparatorLocation = i
                break
            }
        }

        // --------------------------------------------------------------------
        // Step 2
        //
        // Parse table
        //
        // Each sequence of "=" in table's top border denotes a column
        // Each sequence of "-" in table column span row denotes a column (that potentially spans multiple columns)
        //
        // Each row either ends when
        // - The following line only contains '-' denoting column span row
        // - The following line's first column area contains text
        // --------------------------------------------------------------------

        const parseColumn = (line: string, marker: '-' | '='): Array<{ startCoord: number; endCoord: number }> => {
            const columnData = new Array<{ startCoord: number; endCoord: number }>()
            let endCoord = 0

            while (true) {
                const startCoord = line.indexOf(marker, endCoord)
                endCoord = line.indexOf(' ', startCoord)

                // Cannot find anymore column starts
                if (startCoord === -1) {
                    break
                }

                // Current column has no end space
                if (endCoord === -1) {
                    endCoord = line.length
                }

                columnData.push({ startCoord, endCoord })
            }

            return columnData
        }

        const columnData = parseColumn(tableLines[0], '=')
        const getColSpan = (colStartCoord: number, colEndCoord?: number): number => {
            let startColumnIdx = 0
            while (startColumnIdx < columnData.length && colStartCoord > columnData[startColumnIdx].startCoord) {
                startColumnIdx++
            }

            let endColumnIdx: number
            if (colEndCoord === undefined) {
                endColumnIdx = columnData.length
            } else {
                endColumnIdx = startColumnIdx + 1
                while (endColumnIdx < columnData.length && colEndCoord > columnData[endColumnIdx].startCoord) {
                    endColumnIdx++
                }
            }

            return endColumnIdx - startColumnIdx
        }

        const parseRow = (isHeadRow: boolean, rowStartCoord: number, rowEndCoord: number): RstTableRow => {
            const lastRowIsHeaderSeparator = simpleTableRe.test(tableLines[rowEndCoord - 1])
            const lastRowIsColSpanMarker = simpleTableColSpanRe.test(tableLines[rowEndCoord - 1])

            const rowLines = lastRowIsHeaderSeparator || lastRowIsColSpanMarker
                ? tableLines.slice(rowStartCoord, rowEndCoord - 1)
                : tableLines.slice(rowStartCoord, rowEndCoord)

            const rowColumnData = lastRowIsColSpanMarker
                ? parseColumn(tableLines[rowEndCoord - 1], '-')
                : columnData

            // Parse each cell based on column data
            const rowCells = Array<RstTableCell>()
            for (let i = 0; i < rowColumnData.length; i++) {
                const { startCoord, endCoord } = rowColumnData[i]

                // Last column of simple table has unbounded width
                const colSpan = (i === rowColumnData.length - 1)
                    ? getColSpan(startCoord)
                    : getColSpan(startCoord, endCoord)
                const cellText = (i === rowColumnData.length - 1)
                    ? rowLines.map((line) => line.substring(startCoord)).join('\n')
                    : rowLines.map((line) => line.substring(startCoord, endCoord)).join('\n')

                const cellNodes = parserState.parseRstToAst(cellText, startLineIdx + rowStartCoord)

                rowCells.push(new RstTableCell(
                    parserState.registrar,
                    {
                        startLineIdx: startLineIdx + rowStartCoord,
                        endLineIdx: lastRowIsHeaderSeparator || lastRowIsColSpanMarker
                            ? startLineIdx + rowEndCoord - 1
                            : startLineIdx + rowEndCoord,
                    },
                    cellNodes,
                    1,
                    colSpan,
                    endCoord - startCoord,
                ))
            }

            return new RstTableRow(
                parserState.registrar,
                {
                    startLineIdx: startLineIdx + rowStartCoord,
                    endLineIdx: lastRowIsHeaderSeparator || lastRowIsColSpanMarker
                        ? startLineIdx + rowEndCoord - 1
                        : startLineIdx + rowEndCoord,
                },
                rowCells,
                isHeadRow,
            )
        }

        const headRows = new Array<RstTableRow>()
        const bodyRows = new Array<RstTableRow>()

        for (let i = 1; i < tableLines.length - 1; i++) {
            const rowStartCoord = i

            // Advance i to end of current row
            // Skip this search if [i === tableLines.length - 2] since it is the last content row
            // [tableLines.length - 1] contains end of table border
            for (let j = i; j < tableLines.length - 2; j++) {
                // If next line is column span underlines or header separator, then we've reached end of current row
                if (simpleTableRe.test(tableLines[j + 1]) || simpleTableColSpanRe.test(tableLines[j + 1])) {
                    i += 1 // Skip the col-span underline
                    break
                }

                // If next line has text in first column, then we've reached end of current row
                const firstColumnOfNextLine = tableLines[j + 1].substring(columnData[0].startCoord, columnData[0].endCoord).trim()
                if (firstColumnOfNextLine.length > 0) {
                    break
                }

                i += 1
            }

            const rowEndCoord = i + 1
            const isHeadRow = rowStartCoord < headSeparatorLocation
            const row = parseRow(isHeadRow, rowStartCoord, rowEndCoord)

            if (isHeadRow) {
                headRows.push(row)
            } else {
                bodyRows.push(row)
            }
        }

        const endLineIdx = parserState.lineIdx
        return new RstTable(parserState.registrar, { startLineIdx, endLineIdx }, headRows, bodyRows)
    },
}
