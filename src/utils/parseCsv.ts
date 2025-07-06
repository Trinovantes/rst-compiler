export function parseCsv(csvText?: string | null): Array<Array<string>> {
    if (!csvText) {
        return []
    }

    const rows = new Array<Array<string>>()

    let columns = new Array<string>()
    let columnText = ''
    let isInQuote = false

    const addRow = () => {
        rows.push(columns)
        columns = []
    }
    const addColumn = () => {
        columns.push(columnText.trim())
        columnText = ''
    }

    for (let i = 0; i < csvText.length; i++) {
        const curr = csvText[i]
        const next: string | undefined = csvText[i + 1]

        if (curr === '\n' && !isInQuote) {
            addColumn() // Ends current column and row
            addRow()
            continue
        }

        if (curr === ',' && !isInQuote) {
            addColumn() // Ends current column
            continue
        }

        // Double quotes inside quote is treated as single literal quote
        if (curr === '"' && next === '"' && isInQuote) {
            columnText += '"'
            i += 1 // Skip second quote char
            continue
        }

        if (curr === '"') {
            isInQuote = !isInQuote
            continue
        }

        columnText += curr
    }

    addColumn()
    addRow()

    return rows
}
