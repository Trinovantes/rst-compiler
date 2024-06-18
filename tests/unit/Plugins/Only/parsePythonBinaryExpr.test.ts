import { PyToken, PyTokenType, evaluatePythonExpr, parsePythonBinaryExpr, tokenizePythonBinaryExpr } from '@/Plugins/Only/parsePythonBinaryExpr.js'
import { describe, expect, test } from 'vitest'

describe('tokenizePythonBinaryExpr', () => {
    test.each<{
        testInput: string
        expectedToken: PyToken
    }>([
        {
            testInput: 'not',
            expectedToken: {
                type: PyTokenType.NOT,
            },
        },
        {
            testInput: 'and',
            expectedToken: {
                type: PyTokenType.AND,
            },
        },
        {
            testInput: 'or',
            expectedToken: {
                type: PyTokenType.OR,
            },
        },
        {
            testInput: '(',
            expectedToken: {
                type: PyTokenType.L_PAREN,
            },
        },
        {
            testInput: ')',
            expectedToken: {
                type: PyTokenType.R_PAREN,
            },
        },
        {
            testInput: 'v',
            expectedToken: {
                type: PyTokenType.TERMINAL,
                value: 'v',
            },
        },
    ])('single token $expectedToken.type', ({ testInput, expectedToken }) => {
        expect(tokenizePythonBinaryExpr(testInput)).toStrictEqual([expectedToken])
    })

    test('mixed example', () => {
        const input = 'not (v and (v or not v))'
        const tokens = tokenizePythonBinaryExpr(input)

        expect(tokens).toStrictEqual([
            { type: PyTokenType.NOT },
            { type: PyTokenType.L_PAREN },
            { type: PyTokenType.TERMINAL, value: 'v' },
            { type: PyTokenType.AND },
            { type: PyTokenType.L_PAREN },
            { type: PyTokenType.TERMINAL, value: 'v' },
            { type: PyTokenType.OR },
            { type: PyTokenType.NOT },
            { type: PyTokenType.TERMINAL, value: 'v' },
            { type: PyTokenType.R_PAREN },
            { type: PyTokenType.R_PAREN },
        ])
    })
})

describe('parsePythonBinaryExpr', () => {
    test('single terminal', () => {
        expect(parsePythonBinaryExpr('a')).toStrictEqual({
            terminal: 'a',
        })
    })

    test('NOT expr', () => {
        expect(parsePythonBinaryExpr('not a')).toStrictEqual({
            operator: PyTokenType.NOT,
            left: {
                terminal: 'a',
            },
        })
    })

    test('AND expr', () => {
        expect(parsePythonBinaryExpr('a and b')).toStrictEqual({
            operator: PyTokenType.AND,
            left: {
                terminal: 'a',
            },
            right: {
                terminal: 'b',
            },
        })
    })

    test('OR expr', () => {
        expect(parsePythonBinaryExpr('a and b')).toStrictEqual({
            operator: PyTokenType.AND,
            left: {
                terminal: 'a',
            },
            right: {
                terminal: 'b',
            },
        })
    })

    test('PAREN', () => {
        expect(parsePythonBinaryExpr('(a)')).toStrictEqual({
            terminal: 'a',
        })
    })

    test('mixed example', () => {
        const input = 'not (v and (v or not v))'
        const expr = parsePythonBinaryExpr(input)

        expect(expr).toStrictEqual({
            operator: PyTokenType.NOT,
            left: {
                operator: PyTokenType.AND,
                left: {
                    terminal: 'v',
                },
                right: {
                    operator: PyTokenType.OR,
                    left: {
                        terminal: 'v',
                    },
                    right: {
                        operator: PyTokenType.NOT,
                        left: {
                            terminal: 'v',
                        },
                    },
                },
            },
        })
    })
})

describe('evaluatePythonExpr', () => {
    test('single terminal', () => {
        expect(evaluatePythonExpr('a')).toBe(false)
        expect(evaluatePythonExpr('a', { a: true })).toBe(true)
    })

    test('NOT expr', () => {
        expect(evaluatePythonExpr('not a')).toBe(true)
        expect(evaluatePythonExpr('not a', { a: true })).toBe(false)
    })

    test('AND expr', () => {
        expect(evaluatePythonExpr('a and b')).toBe(false)
        expect(evaluatePythonExpr('a and b', { a: true })).toBe(false)
        expect(evaluatePythonExpr('a and b', { b: true })).toBe(false)
        expect(evaluatePythonExpr('a and b', { a: true, b: true })).toBe(true)
    })

    test('OR expr', () => {
        expect(evaluatePythonExpr('a or b')).toBe(false)
        expect(evaluatePythonExpr('a or b', { a: true })).toBe(true)
        expect(evaluatePythonExpr('a or b', { b: true })).toBe(true)
        expect(evaluatePythonExpr('a or b', { a: true, b: true })).toBe(true)
    })

    test('NOT AND', () => {
        expect(evaluatePythonExpr('not (a and b)')).toBe(true)
        expect(evaluatePythonExpr('not (a and b)', { a: true, b: false })).toBe(true)
        expect(evaluatePythonExpr('not (a and b)', { a: false, b: true })).toBe(true)
        expect(evaluatePythonExpr('not (a and b)', { a: true, b: true })).toBe(false)
    })

    test('mixed example', () => {
        const input = 'not (v and (v or not v))'
        expect(evaluatePythonExpr(input)).toBe(true)
        expect(evaluatePythonExpr(input, { v: true })).toBe(false)
    })
})
