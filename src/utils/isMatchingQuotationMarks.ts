export function isMatchingQuotationMarks(start?: string, end?: string): boolean {
    if (!start) {
        return false
    }
    if (!end) {
        return false
    }

    switch (true) {
        case (start === "'" && end === "'"):
        case (start === '"' && end === '"'):
        case (start === '<' && end === '>'):
        case (start === '(' && end === ')'):
        case (start === '[' && end === ']'):
        case (start === '{' && end === '}'):
            return true
    }

    return false
}
