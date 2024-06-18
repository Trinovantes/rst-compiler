import { removeEscapeChar } from './removeEscapeChar.js'

const abbrRe = new RegExp('' +
    '^' +
        '(?<shortForm>(?:.|\n)+?)' +
        '(\\s?' +
            '(?<!\\\\)\\(' + // Opening bracket (not preceded by escape slash)
            '(?<longForm>.+)' +
            '(?<!\\\\)\\)' + // Closing bracket (not preceded by escape slash)
        ')?' +
    '$',
)

export function parseAbbr(rawText: string) {
    const abbrMatch = abbrRe.exec(rawText)
    const rawShortForm = abbrMatch?.groups?.shortForm ?? rawText
    const rawLongForm = abbrMatch?.groups?.longForm ?? ''

    const shortForm = removeEscapeChar(rawShortForm)
    const longForm = removeEscapeChar(rawLongForm)

    return {
        shortForm,
        longForm,
    }
}
