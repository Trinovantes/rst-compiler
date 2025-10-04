import { simpleNameReStr } from '../SimpleName.ts'
import { removeEscapeChar } from './removeEscapeChar.ts'

// Good enough url regex that assumes url is at least 3 characters long (e.g. "a.a")
export const urlRe = /[a-zA-Z][\w.\-+]*:(?:\/\/)?[A-Za-z0-9\-._~:/?#[\]\\@!$&'()*+,;=]{3,}(?=\s|$|>)/
export const emailRe = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/
export const filePathRe = /\/?(?:[\w.\-+]+\/)+(?<fileName>\w+)(?:\.(?<fileExt>\w+))?/

export const standaloneHyperlinkRefReStr = [
    `(?:(?<simpleName>${simpleNameReStr})(?<simpleNameTail>__?))`,          // Name_
    `<(?<embedUrl>${urlRe.source})>`,                                       // <https>
    `(?<url>${urlRe.source})`,                                              // https
    `<(?<embedEmail>${emailRe.source})>`,                                   // <a@b.c>
    `(?<email>${emailRe.source})`,                                          // a@b.c
].join('|')

const embededUrlRe = new RegExp('' +
    '^' +
        '(?:(?<label>(?:.|\n)+?)\\s?)?' + // Label followed by optional whitespace
        '(?<!\\\\)<' + // Opening bracket (not preceded by escape slash)
        '(?<target>.+)' + // Target
        '(?<!\\\\)>' + // Closing bracket (not preceded by escape slash)
    '$',
)

export function parseEmbededRef(rawText: string, targetMightBeEmail = false) {
    const urlMatch = embededUrlRe.exec(rawText)
    const rawLabel = urlMatch?.groups?.label ?? urlMatch?.groups?.target ?? rawText
    const rawTarget = urlMatch?.groups?.target ?? rawText

    const escapedLabel = removeEscapeChar(rawLabel)
    const escapedTarget = removeEscapeChar(rawTarget)

    const isEmbeded = Boolean(urlMatch?.groups?.target)
    const isUrl = new RegExp(`^${urlRe.source}$`).test(escapedTarget)
    const isEmail = targetMightBeEmail && new RegExp(`^${emailRe.source}$`).test(escapedTarget)
    const isFilePath = new RegExp(`^${filePathRe.source}$`).test(escapedTarget)

    const label = escapedLabel.startsWith('mailto:')
        ? escapedLabel.substring('mailto:'.length)
        : escapedLabel

    const target = isEmail
        ? `mailto:${escapedTarget}`
        : escapedTarget

    const isAlias = (() => {
        // Embeded target can only be an alias if it ends with non-escaped underscore
        if (isEmbeded) {
            return rawTarget.endsWith('_') && !rawTarget.endsWith('\\_')
        }

        // If it's url/email/path, then it cannot be an alias
        if (isUrl || isEmail || isFilePath) {
            return false
        }

        // Anything else is treated as an alias to a linkable node (e.g. HyperlinkTarget, Citation, etc.)
        return true
    })()

    return {
        label,
        target,
        isAlias,
        isEmbeded,
    }
}
