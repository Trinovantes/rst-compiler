import { decompressFromBase64 } from 'lz-string'
import defaultText from './DefaultText.rst?raw'

export function getDefaultText(useUrlHash = true): string {
    if (useUrlHash) {
        const windowHash = window.location.hash
        if (/#.+/.test(windowHash)) {
            try {
                return decompressFromBase64(windowHash.substring(1))
            } catch (err) {
                console.warn(err)
            }
        }
    }

    return defaultText
}
