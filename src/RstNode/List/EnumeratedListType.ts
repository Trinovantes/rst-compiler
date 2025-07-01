import { romanUpperRe, romanLowerRe, romanToInt } from '@/utils/romanToInt.js'

export type RstEnumeratedListType =
    | 'Arabic'
    | 'AlphabetUpper'
    | 'AlphabetLower'
    | 'RomanUpper'
    | 'RomanLower'

export function getEnumeratedListType(bulletValue: string): RstEnumeratedListType | null {
    switch (true) {
        case romanUpperRe.test(bulletValue):
            return 'RomanUpper'

        case romanLowerRe.test(bulletValue):
            return 'RomanLower'

        case bulletValue === '#':
        case /^[0-9]+$/.test(bulletValue):
            return 'Arabic'

        case /^[A-Z]$/.test(bulletValue):
            return 'AlphabetUpper'

        case /^[a-z]$/.test(bulletValue):
            return 'AlphabetLower'

        default:
            return null
    }
}

export function isSequentialBullet(currBulletValue: string, prevBulletValue?: string): boolean {
    if (!prevBulletValue) {
        return true
    }

    if (currBulletValue === '#') {
        return true
    }

    const prevType = getEnumeratedListType(prevBulletValue)
    const currType = getEnumeratedListType(currBulletValue)
    if (prevType !== currType) {
        return false
    }

    switch (currType) {
        case 'Arabic': {
            const prev = parseInt(prevBulletValue)
            const curr = parseInt(currBulletValue)
            return prev + 1 === curr
        }

        case 'AlphabetUpper':
        case 'AlphabetLower': {
            const prev = prevBulletValue.toUpperCase().charCodeAt(0)
            const curr = currBulletValue.toUpperCase().charCodeAt(0)
            return prev + 1 === curr
        }

        case 'RomanUpper':
        case 'RomanLower': {
            const prev = romanToInt(prevBulletValue.toUpperCase())
            const curr = romanToInt(currBulletValue.toUpperCase())
            return prev + 1 === curr
        }

        default:
            return true
    }
}
