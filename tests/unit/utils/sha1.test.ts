import { sha1 } from '../../../src/utils/sha1.ts'
import { expect, test } from 'vitest'
import crypto from 'node:crypto'

test.each([
    'abc',
    'hello world',
    'a'.repeat(54),
    'a'.repeat(55),
    'a'.repeat(56),
    'Montréal',
    '42',
    '✅',
])('hash "%s"', (input) => {
    const expectedValue = crypto.createHash('sha1').update(input).digest('hex')
    expect(sha1(input)).toBe(expectedValue)
})
