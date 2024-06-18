export function sanitizeHtml(input: string): string {
    if (/&(amp|lt|gt|quot|apos);/.test(input)) {
        throw new Error('Double sanitize')
    }

    return input
        .replaceAll(/&(?![a-z]+;)/g, '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;')
}
