export function removeEscapeChar(origText: string, isUrl = false): string {
    let newText = ''

    for (let i = 0; i < origText.length; i++) {
        const char = origText[i]
        if (char !== '\\') {
            // Not escape character, continue as normal
            newText += char
            continue
        }

        const nextChar = origText.at(i + 1)
        if (nextChar === undefined) {
            // There is no nextChar (end of string)
            // Assume escape slash is to be interpreted as literal slash
            newText += '\\'
        } else if (!/\s/.test(nextChar)) {
            // Include nextChar as literal if it's not a whitespace
            newText += nextChar
        } else if (/\s/.test(nextChar) && isUrl) {
            // Escaped whitespace in url context is treated as single space
            newText += ' '
        }

        i += 1 // Just processed nextChar so skip over it
    }

    return newText
}
