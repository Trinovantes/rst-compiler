import { expect, test } from 'vitest'
import { isMatchingQuotationMarks } from '../../../src/utils/isMatchingQuotationMarks.ts'

test('should return true for matching quotation marks', () => {
    expect(isMatchingQuotationMarks("'", "'")).toBe(true)
    expect(isMatchingQuotationMarks('"', '"')).toBe(true)
    expect(isMatchingQuotationMarks('<', '>')).toBe(true)
    expect(isMatchingQuotationMarks('(', ')')).toBe(true)
    expect(isMatchingQuotationMarks('[', ']')).toBe(true)
    expect(isMatchingQuotationMarks('{', '}')).toBe(true)
})

test('should return false for non-matching quotation marks', () => {
    expect(isMatchingQuotationMarks("'", '"')).toBe(false)
    expect(isMatchingQuotationMarks('<', ']')).toBe(false)
    expect(isMatchingQuotationMarks('(', '}')).toBe(false)
    expect(isMatchingQuotationMarks('[', ')')).toBe(false)
    expect(isMatchingQuotationMarks('{', '>')).toBe(false)
})

test('should return false if start or end is undefined', () => {
    expect(isMatchingQuotationMarks(undefined, "'")).toBe(false)
    expect(isMatchingQuotationMarks("'", undefined)).toBe(false)
})
