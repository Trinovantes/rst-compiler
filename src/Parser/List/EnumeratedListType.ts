import { romanToInt } from '@/utils/romanToInt.js'
import { romanUpperRe, romanLowerRe } from './EnumeratedListNode.js'

export const enum EnumeratedListType {
    Arabic = 'Arabic',
    AlphabetUpper = 'AlphabetUpper',
    AlphabetLower = 'AlphabetLower',
    RomanUpper = 'RomanUpper',
    RomanLower = 'RomanLower',
}

export function getEnumeratedListType(bulletValue: string): EnumeratedListType {
    switch (true) {
        case romanUpperRe.test(bulletValue):
            return EnumeratedListType.RomanUpper

        case romanLowerRe.test(bulletValue):
            return EnumeratedListType.RomanLower

        case bulletValue === '#':
        case /^[0-9]+$/.test(bulletValue):
            return EnumeratedListType.Arabic

        case /^[A-Z]$/.test(bulletValue):
            return EnumeratedListType.AlphabetUpper

        case /^[a-z]$/.test(bulletValue):
            return EnumeratedListType.AlphabetLower

        default:
            throw new Error('Failed to getEnumeratedListType')
    }
}

export function isSequentialBullet(listType: EnumeratedListType, currBulletValue: string, prevBulletValue?: string): boolean {
    if (!prevBulletValue) {
        return true
    }

    if (currBulletValue === '#') {
        return true
    }

    switch (listType) {
        case EnumeratedListType.Arabic: {
            const prev = parseInt(prevBulletValue)
            const curr = parseInt(currBulletValue)
            return prev + 1 === curr
        }

        case EnumeratedListType.AlphabetUpper:
        case EnumeratedListType.AlphabetLower: {
            const prev = prevBulletValue.toUpperCase().charCodeAt(0)
            const curr = currBulletValue.toUpperCase().charCodeAt(0)
            return prev + 1 === curr
        }

        case EnumeratedListType.RomanUpper:
        case EnumeratedListType.RomanLower: {
            const prev = romanToInt(prevBulletValue.toUpperCase())
            const curr = romanToInt(currBulletValue.toUpperCase())
            return prev + 1 === curr
        }

        default:
            return true
    }
}
