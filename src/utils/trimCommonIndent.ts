export function trimCommonIndent(input: string): string {
    let lines = input.split('\n') // Split into individual lines to process
    lines = lines.map((line) => line.trimEnd()) // Remove trailing whitespace from every line
    lines = trimArray(lines)

    let lowestCommonIndent = Number.MAX_SAFE_INTEGER
    for (const line of lines) {
        // Skip checking blank lines
        if (!line) {
            continue
        }

        const indentSize = line.search(/\S|$/) ?? 0
        lowestCommonIndent = Math.min(lowestCommonIndent, indentSize)
    }

    const trimmedLines = lines.map((line) => line.substring(lowestCommonIndent))
    return trimmedLines.join('\n')
}

function trimArray(lines: Array<string>): Array<string> {
    // Remove all blank lines at start
    let startIdx = 0
    while (!lines[startIdx] && startIdx < lines.length) {
        startIdx += 1
    }

    // Remove all newlines at end
    let endIdx = lines.length - 1
    while (!lines[endIdx] && endIdx >= 0) {
        endIdx -= 1
    }

    return lines.slice(startIdx, endIdx + 1)
}
