import { tokenizeInput } from '@/Lexer/tokenizeInput.js'
import { test, expect } from 'vitest'

test('when input is empty, it should return empty array', () => {
    const input = ''
    const output = tokenizeInput(input)

    expect(output.length).toBe(0)
})

test('when input has 1 line (no newline), it should return 1 Line', () => {
    const input = '12345'
    const output = tokenizeInput(input)

    expect(output.length).toBe(1)

    expect(output[0].idx).toBe(0)
    expect(output[0].str).toBe('12345')
})

test('when input has 1 line (with newline), it should return 1 Line excluding newline', () => {
    const input = '12345\n'
    const output = tokenizeInput(input)

    expect(output.length).toBe(1)

    expect(output[0].idx).toBe(0)
    expect(output[0].str).toBe('12345')
})

test('when input has 3 newlines at end, it should return 3 Line', () => {
    const input = '01234\n\n\n'
    //             01234|5|6|7
    const output = tokenizeInput(input)

    expect(output.length).toBe(3)

    expect(output[0].idx).toBe(0)
    expect(output[0].str).toBe('01234')

    expect(output[1].idx).toBe(6)
    expect(output[1].str).toBe('')

    expect(output[2].idx).toBe(7)
    expect(output[2].str).toBe('')
})
