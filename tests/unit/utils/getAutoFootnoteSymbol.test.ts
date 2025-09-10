import { expect, test } from 'vitest'
import { getAutoFootnoteSymbol } from '../../../src/utils/getAutoFootnoteSymbol.js'

test('should throw error when input is < 1', () => {
    expect(() => getAutoFootnoteSymbol(0)).toThrow(/symNum must be >= 1/)
})

test.each([
    [1, '*'],
    [9, '&diams;'],
    [10, '&clubs;'],
    [11, '**'],
    [19, '&diams;&diams;'],
    [20, '&clubs;&clubs;'],
    [21, '***'],
    [31, '****'],
    [41, '*****'],
])('when input is "%d", it should return "%s"', (symNum, expectedOutput) => {
    expect(getAutoFootnoteSymbol(symNum)).toBe(expectedOutput)
})
