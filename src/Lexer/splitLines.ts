import { Line } from './Line.js'

export function splitLines(input: string): Array<Line> {
    const lines = new Array<Line>()

    let idx = 0
    while (idx < input.length) {
        const start = idx
        const end = input.indexOf('\n', start)
        const len = end - start
        const str = input.slice(start, end)

        lines.push({
            idx,
            len,
            str,
        })

        idx = end + 1 // Skip \n character
    }

    return lines
}
