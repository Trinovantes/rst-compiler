const hexReStr = '[a-fA-F0-9]+'
const unicodeReStr = [
    `0x(?<hex>${hexReStr})`,
    `\\\\x(?<hexSlashX>${hexReStr})`,
    `U\\+(?<hexUpperU>${hexReStr})`,
    `u(?<hexLowerU>${hexReStr})`,
    `\\\\u(?<hexSlashU>${hexReStr})`,
    '(?<decimal>\\d)',
].join('|')

export function convertUnicode(inputStr: string): string {
    let outputStr = ''
    let consumedIdx = 0
    const unicodeRe = new RegExp(unicodeReStr, 'g')

    while (consumedIdx < inputStr.length) {
        const unicodeMatch = unicodeRe.exec(inputStr)
        if (!unicodeMatch) {
            break
        }

        const precedingTextLen = unicodeMatch.index - consumedIdx
        if (precedingTextLen > 0) {
            const precedingText = inputStr.substring(consumedIdx, consumedIdx + precedingTextLen)
            outputStr += precedingText
            consumedIdx += precedingText.length
        }

        const decimal = unicodeMatch.groups?.decimal
        const hex =
            unicodeMatch.groups?.hex ??
            unicodeMatch.groups?.hexSlashX ??
            unicodeMatch.groups?.hexUpperU ??
            unicodeMatch.groups?.hexLowerU ??
            unicodeMatch.groups?.hexSlashU

        if (decimal !== undefined) {
            outputStr += String.fromCharCode(parseInt(decimal, 10))
        } else if (hex !== undefined) {
            outputStr += String.fromCharCode(parseInt(hex, 16))
        } else {
            throw new Error('Failed to convertUnicode')
        }

        consumedIdx += unicodeMatch[0].length
    }

    if (consumedIdx < inputStr.length) {
        const remainderText = inputStr.substring(consumedIdx)
        outputStr += remainderText
    }

    return outputStr
}
