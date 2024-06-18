import { expect, test } from 'vitest'
import { isMatchingQuotationMarks } from '@/utils/isMatchingQuotationMarks.js'

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
