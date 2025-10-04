import { romanToInt } from '../../../src/utils/romanToInt.ts'
import { expect, test } from 'vitest'

test.each([
    ['I', 1],
    ['III', 3],
    ['LVIII', 58],
    ['MCMXCIV', 1994],
    ['XII', 12],
    ['XXVII', 27],
])('%s should equal %i', (roman, expectedValue) => {
    expect(romanToInt(roman)).toBe(expectedValue)
})
