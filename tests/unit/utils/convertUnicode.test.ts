import { expect, test, describe } from 'vitest'
import { convertUnicode } from '../../../src/utils/convertUnicode.ts'

test('when input does not contain decimal or hex numbers, it should return original string', () => {
    const input = 'hello world'
    expect(convertUnicode(input)).toBe(input)
})

describe.each([
    ['0xA9'],
    ['U+2122'],
    ['U+02014'],
])('converts %s', (inputHex) => {
    const hexNum = parseInt(inputHex.substring(2), 16)
    const unicode = String.fromCharCode(hexNum)

    test('when input is singular hexcode, it returns just the unicode', () => {
        expect(convertUnicode(inputHex)).toBe(unicode)
    })

    test('when hexcode is in the middle of normal text, it returns the hexcode replaced with unicode', () => {
        const input = `hello ${inputHex} world`
        const output = `hello ${unicode} world`
        expect(convertUnicode(input)).toBe(output)
    })

    test('when hexcode is at the start of normal text, it returns the hexcode replaced with unicode', () => {
        const input = `${inputHex} hello world `
        const output = `${unicode} hello world `
        expect(convertUnicode(input)).toBe(output)
    })

    test('when hexcode is at the end of normal text, it returns the hexcode replaced with unicode', () => {
        const input = `hello world ${inputHex}`
        const output = `hello world ${unicode}`
        expect(convertUnicode(input)).toBe(output)
    })

    test('when hexcode is repeated multiple times, all instances of hexcode are replaced with unicode', () => {
        const input = `${inputHex} ${inputHex} ${inputHex}`
        const output = `${unicode} ${unicode} ${unicode}`
        expect(convertUnicode(input)).toBe(output)
    })
})
