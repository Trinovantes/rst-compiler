import { romanUpperRe, romanLowerRe, romanToInt } from '@/utils/romanToInt.js'

export const enum RstEnumeratedListType {
    Arabic = 'Arabic',
    AlphabetUpper = 'AlphabetUpper',
    AlphabetLower = 'AlphabetLower',
    RomanUpper = 'RomanUpper',
    RomanLower = 'RomanLower',
}

export function getEnumeratedListType(bulletValue: string): RstEnumeratedListType {
    switch (true) {
        case romanUpperRe.test(bulletValue):
            return RstEnumeratedListType.RomanUpper

        case romanLowerRe.test(bulletValue):
            return RstEnumeratedListType.RomanLower

        case bulletValue === '#':
        case /^[0-9]+$/.test(bulletValue):
            return RstEnumeratedListType.Arabic

        case /^[A-Z]$/.test(bulletValue):
            return RstEnumeratedListType.AlphabetUpper

        case /^[a-z]$/.test(bulletValue):
            return RstEnumeratedListType.AlphabetLower

        default:
            throw new Error('Failed to getEnumeratedListType')
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
        case RstEnumeratedListType.Arabic: {
            const prev = parseInt(prevBulletValue)
            const curr = parseInt(currBulletValue)
            return prev + 1 === curr
        }

        case RstEnumeratedListType.AlphabetUpper:
        case RstEnumeratedListType.AlphabetLower: {
            const prev = prevBulletValue.toUpperCase().charCodeAt(0)
            const curr = currBulletValue.toUpperCase().charCodeAt(0)
            return prev + 1 === curr
        }

        case RstEnumeratedListType.RomanUpper:
        case RstEnumeratedListType.RomanLower: {
            const prev = romanToInt(prevBulletValue.toUpperCase())
            const curr = romanToInt(currBulletValue.toUpperCase())
            return prev + 1 === curr
        }

        default:
            return true
    }
}
