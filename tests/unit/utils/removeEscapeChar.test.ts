import { removeEscapeChar } from '@/utils/removeEscapeChar.js'
import { expect, test } from 'vitest'

test('escaped non-whitespace characters are preserved', () => {
    expect(removeEscapeChar('a\\b')).toBe('ab')
    expect(removeEscapeChar('c\\d\\e')).toBe('cde')
    expect(removeEscapeChar('\\\\')).toBe('\\')
})

test('escaped whitespace characters are removed', () => {
    expect(removeEscapeChar('a\\ b')).toBe('ab')
    expect(removeEscapeChar('c\\ d\\ e')).toBe('cde')
    expect(removeEscapeChar('\\ ')).toBe('')
})

test('escaped whitespace characters (in url context) are replaced with single space', () => {
    expect(removeEscapeChar('a\\ b', true)).toBe('a b')
    expect(removeEscapeChar('c\\ d\\ e', true)).toBe('c d e')
    expect(removeEscapeChar('\\\t', true)).toBe(' ')
})

test('when escape slash is at the end of the string, it should keep the slash.', () => {
    expect(removeEscapeChar('a\\')).toBe('a\\')
})

test('when the input is empty, it should return empty string', () => {
    expect(removeEscapeChar('')).toBe('')
})

test('when the input does not have escape slash, it should return the original input', () => {
    expect(removeEscapeChar('mno')).toBe('mno')
    expect(removeEscapeChar('p q r')).toBe('p q r')
})
