// E -> ( E )
//   -> not E
//   -> E and E
//   -> E or  E
//   -> v

// ----------------------------------------------------------------------------
// MARK: Lexer
// ----------------------------------------------------------------------------

export type PyTokenType =
    | 'NOT'
    | 'AND'
    | 'OR'
    | 'L_PAREN'
    | 'R_PAREN'
    | 'TERMINAL'

export type PyToken = {
    type: PyTokenType
    value?: string
}

export function findEndOfWord(input: string, position: number): number {
    // Already out of bounds
    if (position >= input.length) {
        return input.length
    }

    // If already at word boundary, return current position
    const wordSeparatorRe = /[\s()]/
    if (wordSeparatorRe.test(input.charAt(position))) {
        return position
    }

    // Advance position untill we find next boundary or the end of the string
    while (position < input.length && !wordSeparatorRe.test(input.charAt(position))) {
        position++
    }

    return position
}

export function tokenizePythonBinaryExpr(input: string): Array<PyToken> {
    const tokens = new Array<PyToken>()

    let idx = 0
    while (idx < input.length) {
        const c = input.charAt(idx)

        // Skip whitespace
        if (/\s/.test(c)) {
            idx += 1
            continue
        }

        const endOfWordIdx = findEndOfWord(input, idx)
        const currentWord = input.substring(idx, endOfWordIdx)

        switch (true) {
            case c === '(': {
                tokens.push({ type: 'L_PAREN' })
                idx += 1
                break
            }
            case c === ')': {
                tokens.push({ type: 'R_PAREN' })
                idx += 1
                break
            }
            case currentWord === 'not': {
                tokens.push({ type: 'NOT' })
                idx += currentWord.length
                break
            }
            case currentWord === 'and': {
                tokens.push({ type: 'AND' })
                idx += currentWord.length
                break
            }
            case currentWord === 'or': {
                tokens.push({ type: 'OR' })
                idx += currentWord.length
                break
            }
            default: {
                tokens.push({ type: 'TERMINAL', value: currentWord })
                idx += currentWord.length
            }
        }
    }

    return tokens
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

export type PyExpr = {
    operator?: 'AND' | 'OR' | 'NOT'
    terminal?: string
    left?: PyExpr
    right?: PyExpr
}

export function parsePythonBinaryExpr(input: string): PyExpr {
    const tokens = tokenizePythonBinaryExpr(input)
    let tokenIdx = 0

    const peek = (offset = 0): PyToken | null => {
        const idx = tokenIdx + offset
        if (idx < 0 || idx >= tokens.length) {
            return null
        }

        return tokens[idx]
    }

    const consume = (expectedTokenType?: PyTokenType): PyToken => {
        if (tokenIdx < 0 || tokenIdx >= tokens.length) {
            throw new Error('Out of tokens')
        }

        const token = tokens[tokenIdx]
        if (expectedTokenType !== undefined && token.type !== expectedTokenType) {
            throw new Error(`Unexpected token expected:${expectedTokenType} actual:${token.type}`)
        }

        tokenIdx += 1
        return token
    }

    const parseExpr = (): PyExpr => {
        switch (true) {
            case peek()?.type === 'L_PAREN': {
                consume('L_PAREN')
                const expr = parseExpr()
                consume('R_PAREN')

                return expr
            }

            case peek()?.type === 'NOT': {
                consume('NOT')
                const expr = parseExpr()

                return {
                    operator: 'NOT',
                    left: expr,
                }
            }

            case peek(1)?.type === 'AND': {
                const left = consume('TERMINAL')
                if (!left.value) {
                    throw new Error('Missing terminal')
                }

                consume('AND')
                const right = parseExpr()

                return {
                    operator: 'AND',
                    left: {
                        terminal: left.value,
                    },
                    right,
                }
            }

            case peek(1)?.type === 'OR': {
                const left = consume('TERMINAL')
                if (!left.value) {
                    throw new Error('Missing terminal')
                }

                consume('OR')
                const right = parseExpr()

                return {
                    operator: 'OR',
                    left: {
                        terminal: left.value,
                    },
                    right,
                }
            }

            case peek()?.type === 'TERMINAL': {
                const terminal = consume('TERMINAL').value
                if (!terminal) {
                    throw new Error('Missing terminal')
                }

                return {
                    terminal,
                }
            }

            default: {
                throw new Error(`Unexpected token:${peek()?.type}`)
            }
        }
    }

    const expr = parseExpr()
    if (tokenIdx !== tokens.length) {
        throw new Error(`Failed to parseExpr tokenIdx:${tokenIdx} tokens:${tokens.length}`)
    }

    return expr
}

// ----------------------------------------------------------------------------
// MARK: Evaluator
// ----------------------------------------------------------------------------

export function evaluatePythonExpr(input: string, env?: Record<string, boolean>): boolean {
    const evalExpr = (expr?: PyExpr): boolean => {
        if (!expr) {
            throw new Error('Missing expr')
        }

        switch (true) {
            case expr.terminal !== undefined: {
                return Boolean(env?.[expr.terminal])
            }

            case expr.operator === 'NOT': {
                return !evalExpr(expr.left)
            }

            case expr.operator === 'AND': {
                return evalExpr(expr.left) && evalExpr(expr.right)
            }

            case expr.operator === 'OR': {
                return evalExpr(expr.left) || evalExpr(expr.right)
            }
        }

        throw new Error('Failed to evalExpr')
    }

    const expr = parsePythonBinaryExpr(input)
    return evalExpr(expr)
}
