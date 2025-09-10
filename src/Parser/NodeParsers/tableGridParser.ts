import type { RstNodeParser } from '../RstParser.js'
import { RstNode } from '../../RstNode/RstNode.js'
import { RstTable } from '../../RstNode/Table/Table.js'
import { RstTableCell } from '../../RstNode/Table/TableCell.js'
import { RstTableRow } from '../../RstNode/Table/TableRow.js'
import { createBooleanTable } from '../../utils/createBooleanTable.js'
import { RstParserError } from '../RstParserError.js'

// ----------------------------------------------------------------------------
// MARK: Grid Parser
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#grid-tables
// ----------------------------------------------------------------------------

const gridTableRe        = /^([ ]*)(?:\+-*)+\+[ ]*$/
const gridTableHeadSepRe = /^([ ]*)(?:\+=*)+\+[ ]*$/

export const tableGridParser: RstNodeParser<'Table'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekTest(gridTableRe)) {
            return null
        }

        // --------------------------------------------------------------------
        // Step 1
        //
        // Collect all lines of the table into an array of strings for easy traversal and indexing
        // --------------------------------------------------------------------

        const tableLines = new Array<string>()
        while (parserState.peekIsContent() && parserState.peekIsIndented(indentSize)) {
            const line = parserState.consume()
            const lineText = line.str.substring(indentSize)
            tableLines.push(lineText)
        }

        // --------------------------------------------------------------------
        // Step 2
        //
        // Find the header/body separation marker if exists (to be used to determine which rows go in <thead> or <tbody>)
        // --------------------------------------------------------------------

        let headSeparatorLocation = -1
        for (let i = 0; i < tableLines.length; i++) {
            if (!gridTableHeadSepRe.test(tableLines[i])) {
                continue
            }

            if (headSeparatorLocation >= 0) {
                throw new RstParserError(parserState, 'Table has multiple head/body row separators')
            }

            headSeparatorLocation = i

            // Now that we know where the head/body is dived, we can replace separator "=" with '-' as if it didn't exist to make the table uniform for next step
            tableLines[i] = tableLines[i].replaceAll('=', '-')
        }

        const parseTableCell = (top: number, left: number, right: number, bot: number): ReadonlyArray<RstNode> => {
            let cellText = ''
            for (let row = top + 1; row < bot; row++) {
                const line = tableLines[row].substring(left + 1, right)
                if (line.length === 0) {
                    continue
                }

                cellText += line + '\n'
            }

            const cellNodes = parserState.parseRstToAst(cellText, startLineIdx + top + 1) // +1 since "top" is the location of the top bar of the cell
            return cellNodes
        }

        // --------------------------------------------------------------------
        // Step 3
        //
        // Start from top-left corner of table and search for all the cells
        // After we find a cell, we queue up the cell's top-right corner and bottom-left corner as candidates for other cells' top-right corners
        // We skip queuing bottom-right since it is redudant as the next cell starting from current's top-right will queue up its bottom-left (current's bottom-right)
        //
        // For each cell, we start at the top-left corner and scan clockwise (right/down/left/up) for "+" markers
        // At each step, we ensure we see the expected characters:
        //      "-" when going left/right
        //      "|" when going up/down
        //
        // If we cannot cycle back to the starting top-left corner, then the original top-left corner that we started with is not the start of an actual table cell (so we disard it and continue)
        //
        //       |  |  |
        //      -0--1--2-
        //       |     |
        //      -3     4-
        //       |     |
        //      -5--6--7-
        //       |  |  |
        //
        // We start at (0)
        //  - Go right and encounter (1)
        //      - Go down but did not find "+" or "|" [FAIL]
        //  - Go right and encounter (2)
        //      - Go down and see (4)
        //          - Go left but did not see "-" [FAIL]
        //      - Go down and see (7)
        //          - Go left and see (6)
        //              - Go up but did not see "|" [FAIL]
        //          - Go left and see (5)
        //              - Go up and see (3) [Ignore since we are not at starting row yet]
        //              - Go up and see (0) [FINISH]
        //
        // Afterwards, we queue up coordinates of corner (2) and (5) and continue the search
        // --------------------------------------------------------------------

        const numRows = tableLines.length
        const numCols = tableLines[0].length
        const tableRight = numCols - 1
        const tableBottom = numRows - 1

        const corners = new Array<[number, number]>([0, 0])
        const parsedCells = new Array<{
            topLeft: [number, number]
            bottomRight: [number, number]
            contents: ReadonlyArray<RstNode>
        }>()

        const scanTopLeft = (top: number, left: number, right: number, bot: number): boolean => {
            for (let i = bot - 1; i >= top; i--) {
                const c = tableLines[i][left]

                if (c === '+') {
                    // Do nothing since this "+" might simply be an intermediate corner for row/col cell
                    // In docutils lib, it tracks every intermediate "+" encountered
                } else if (c !== '|') {
                    // If above bottom-left corner is not "|", then we did not start from a valid bottom-left corner
                    // +--+--+
                    // |     |
                    // +-(+)-+
                    // |  |  |
                    // +--+--+
                    return false
                }
            }

            // Reached top wall and our scan is now complete
            return true
        }

        const scanBotLeft = (top: number, left: number, right: number, bot: number): boolean => {
            for (let i = right - 1; i >= left; i--) {
                const c = tableLines[bot][i]
                if (c === '+') {
                    // Do nothing since this "+" might simply be an intermediate corner for row/col cell
                    // In docutils lib, it tracks every intermediate "+" encountered
                } else if (c !== '-') {
                    // If left of bottom-right corner is not "-", then we did not start from a valid bottom-right corner
                    // +--+--+
                    // |  |  |
                    // +--+ (+)
                    // |  |  |
                    // +--+--+
                    return false
                }
            }

            // Reached left wall
            // Finally check if we can go back up to top wall
            return scanTopLeft(top, left, right, bot)
        }

        const scanBotRight = (top: number, left: number, right: number): [number, number] | null => {
            for (let i = top + 1; i <= tableBottom; i++) {
                const c = tableLines[i][right]
                if (c === '+') {
                    // Found candidate
                    const isValid = scanBotLeft(top, left, right, i)
                    if (isValid) {
                        return [i, right]
                    }
                } else if (c !== '|') {
                    // If below top-right corner is not "|", then we did not start from a valid top-right corner
                    // +-(*)-+
                    // |     |
                    // +--+--|
                    // |  |  |
                    // +--+--+
                    return null
                }
            }

            return null
        }

        const scanTopRight = (top: number, left: number): [number, number] | null => {
            for (let i = left + 1; i <= tableRight; i++) {
                const c = tableLines[top][i]
                if (c === '+') {
                    const bottomRight = scanBotRight(top, left, i)
                    if (bottomRight) {
                        return bottomRight
                    }
                } else if (c !== '-') {
                    // If right of top-left corner is not "-", then we did not start from a valid top-left corner
                    // +--+--+
                    // |  |  |
                    // +-(*) |
                    // |  |  |
                    // +--+--+
                    return null
                }
            }

            return null
        }

        // Use this to track which parts of the table has been scanned and can be skipped later
        // done[i][j] = i-th row (line) j-th column (character in line)
        const done = createBooleanTable(numRows, numCols)

        while (corners.length > 0) {
            const [cornerTop, cornerLeft] = corners.shift() ?? [0xDEADBEEF, 0xDEADBEEF]

            // Reached edges of table and don't need to parse this corner
            if (cornerTop === tableBottom || cornerLeft === tableRight) {
                continue
            }

            // Already processed past this row in current column
            if (done[cornerTop][cornerLeft]) {
                continue
            }

            // Check that we are actually starting in the top-left corner of a cell
            if (tableLines[cornerTop][cornerLeft] !== '+') {
                throw new RstParserError(parserState, 'TopLeft corner of TableCell is not "+"')
            }

            const botRight = scanTopRight(cornerTop, cornerLeft)
            if (!botRight) {
                continue
            }

            const [cornerBot, cornerRight] = botRight
            for (let row = cornerTop; row < cornerBot; row++) {
                for (let col = cornerLeft; col < cornerRight; col++) {
                    done[row][col] = true
                }
            }

            corners.push([cornerTop, cornerRight])
            corners.push([cornerBot, cornerLeft])
            parsedCells.push({
                topLeft: [cornerTop, cornerLeft],
                bottomRight: [cornerBot, cornerRight],
                contents: parseTableCell(cornerTop, cornerLeft, cornerRight, cornerBot),
            })
        }

        // --------------------------------------------------------------------
        // Step 4
        //
        // Construct the final table AST structure from cells found
        // 1. Get all unique top coordinates from table cells (each unique coordinate represents a new <tr> row)
        // 2. For each row <tr>, find all the cells belonging to it based on their top-left coordinate and sort them by left edg
        // 3. For each cell <td>, calculate how many rows/cols each one occupies based on their top/bot left/right edges
        // --------------------------------------------------------------------

        const rowSepCoords = [...new Set(parsedCells.map((cell) => cell.topLeft[0]))].toSorted((a, b) => a - b)
        const getRowSpan = (startRow: number, endRow: number): number => {
            const start = rowSepCoords.indexOf(startRow)
            const end = rowSepCoords.indexOf(endRow)
            if (end === -1) {
                return rowSepCoords.length - start
            } else {
                return end - start
            }
        }

        const colSepCoords = [...new Set(parsedCells.map((cell) => cell.topLeft[1]))].toSorted((a, b) => a - b)
        const getColSpan = (startCol: number, endCol: number): number => {
            const start = colSepCoords.indexOf(startCol)
            const end = colSepCoords.indexOf(endCol)
            if (end === -1) {
                return colSepCoords.length - start
            } else {
                return end - start
            }
        }

        // const rows = new Array<TableRow>()
        const headRows = new Array<RstTableRow>()
        const bodyRows = new Array<RstTableRow>()

        for (const rowCoord of rowSepCoords) {
            const rowCells = new Array<RstTableCell>()
            const cellsOnThisRow = parsedCells
                .filter((cell) => cell.topLeft[0] === rowCoord)
                .toSorted((cellA, cellB) => cellA.topLeft[1] - cellB.topLeft[1])

            let rowStartLineIdx = startLineIdx
            let rowEndLineIdx = startLineIdx + 1

            for (const parsedCell of cellsOnThisRow) {
                const startRow = parsedCell.topLeft[0]
                const startCol = parsedCell.topLeft[1]
                const endRow = parsedCell.bottomRight[0]
                const endCol = parsedCell.bottomRight[1]

                const rowSpan = getRowSpan(startRow, endRow)
                const colSpan = getColSpan(startCol, endCol)

                const cellStartLineIdx = startLineIdx + startRow
                const cellEndLineIdx = startLineIdx + endRow

                rowStartLineIdx = Math.max(rowStartLineIdx, cellStartLineIdx)
                rowEndLineIdx = Math.max(rowEndLineIdx, cellEndLineIdx)

                rowCells.push(new RstTableCell(
                    parserState.registrar,
                    {
                        startLineIdx: cellStartLineIdx,
                        endLineIdx: cellEndLineIdx,
                    },
                    parsedCell.contents,
                    rowSpan,
                    colSpan,
                    endCol - startCol,
                ))
            }

            const isHeadRow = rowCoord < headSeparatorLocation
            if (isHeadRow) {
                headRows.push(new RstTableRow(parserState.registrar, { startLineIdx: rowStartLineIdx, endLineIdx: rowEndLineIdx }, rowCells, isHeadRow))
            } else {
                bodyRows.push(new RstTableRow(parserState.registrar, { startLineIdx: rowStartLineIdx, endLineIdx: rowEndLineIdx }, rowCells, isHeadRow))
            }
        }

        const endLineIdx = parserState.lineIdx
        return new RstTable(parserState.registrar, { startLineIdx, endLineIdx }, headRows, bodyRows)
    },
}
