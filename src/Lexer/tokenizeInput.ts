import { Token } from './Token.js'

export function tokenizeInput(input: string): Array<Token> {
    const tokens = new Array<Token>()

    let idx = 0
    while (idx < input.length) {
        const idxOfNextNewLine = input.indexOf('\n', idx)
        const start = idx
        const end = idxOfNextNewLine === -1
            ? input.length
            : idxOfNextNewLine

        const str = input.slice(start, end)

        tokens.push({
            idx,
            str,
        })

        idx = end + 1 // Skip \n character
    }

    return tokens
}
