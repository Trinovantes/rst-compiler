import { normalizeSimpleName } from '../../src/SimpleName.js'
import { describe, expect, test } from 'vitest'

describe('normalizeSimpleName', () => {
    test('it should convert accented characters to their base character', () => {
        const input = 'Thíś íś a stríñg with áccéntéd charácters.'
        const expectedOutput = 'this-is-a-string-with-accented-characters.'
        expect(normalizeSimpleName(input)).toBe(expectedOutput)
    })

    test('it should convert non-alphanumeric characters to hyphens', () => {
        const input = '1000_!!!Steps'
        const expectedOutput = '1000_-steps'
        expect(normalizeSimpleName(input)).toBe(expectedOutput)
    })

    test('it should convert consequtive hyphens to one hyphen', () => {
        const input = 'a---a'
        const expectedOutput = 'a-a'
        expect(normalizeSimpleName(input)).toBe(expectedOutput)
    })

    test('it should strip leading hyphens', () => {
        const input = '--a'
        const expectedOutput = 'a'
        expect(normalizeSimpleName(input)).toBe(expectedOutput)
    })

    test('it should strip both leading hyphen', () => {
        const input = '--a'
        const expectedOutput = 'a'
        expect(normalizeSimpleName(input)).toBe(expectedOutput)
    })

    test('it should strip trailing hyphen', () => {
        const input = 'a--'
        const expectedOutput = 'a'
        expect(normalizeSimpleName(input)).toBe(expectedOutput)
    })

    test.each([
        ['Rot.Gelb&Grün:+2008', 'rot.gelb-grun:+2008'],
        ['1000_Steps!', '1000_steps'],
        ['A HYPERLINK', 'a-hyperlink'],
        ['a    hyperlink', 'a-hyperlink'],
        ['A HYPERLINK', 'a-hyperlink'],
        ['A\tHyperlink', 'a-hyperlink'],
    ])('"%s" should equal "%s"', (input, expectedOutput) => {
        expect(normalizeSimpleName(input)).toBe(expectedOutput)
    })
})
