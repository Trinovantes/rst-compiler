/**
 * Given a full JS signature, this function returns the local scoped name
 *
 * For `$.getJSON(href, callback[, errback])`, this function returns `getJSON`
 */
export function getJsLocalName(fullName: string): string {
    const localName = /(?<jsName>[a-zA-Z][\w.]+)\(?/.exec(fullName)?.groups?.jsName
    if (!localName) {
        throw new Error(`Failed to getJsLocalName fullName:"${fullName}"`)
    }

    return localName
}
