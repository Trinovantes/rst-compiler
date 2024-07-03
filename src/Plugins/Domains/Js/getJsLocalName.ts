/**
 * Given a full JS signature, this function returns the local scoped name
 *
 * For `$.getJSON(href, callback[, errback])`, this function returns `getJSON`
 */
export function getJsLocalName(fullName: string): string | null {
    return /(?<jsName>[a-zA-Z][\w.]+)\(?/.exec(fullName)?.groups?.jsName ?? null
}
