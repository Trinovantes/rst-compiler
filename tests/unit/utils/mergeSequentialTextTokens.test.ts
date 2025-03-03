import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstStrongEmphasis } from '@/RstNode/Inline/StrongEmphasis.js'
import { RstText } from '@/RstNode/Inline/Text.js'
import { RstNodeSource } from '@/RstNode/RstNode.js'
import { mergeSequentialTextNodes } from '@/utils/mergeSequentialTextNodes.js'
import { expect, test } from 'vitest'

const registrar = new RstNodeRegistrar()
const source: RstNodeSource = {
    startLineIdx: 0xDEADBEEF,
    endLineIdx: 0xDEADBEEF,
}

test('when there are sequential Text tokens, it should merge them all into a single Text token', () => {
    const textNodes = [
        new RstText(registrar, source, 'Hello'),
        new RstText(registrar, source, ' '),
        new RstText(registrar, source, 'World'),
        new RstText(registrar, source, '!'),
    ]

    const mergedNodes = mergeSequentialTextNodes(registrar, textNodes)

    expect(mergedNodes).toHaveLength(1)
    expect(mergedNodes[0].textContent).toBe('Hello World!')
    expect(mergedNodes[0].nodeType).toBe('Text')
})

test('when there are sequential Text tokens in-between non-Text tokens, it should merge the middle Text tokens', () => {
    const textNodes = [
        new RstStrongEmphasis(registrar, source, 'Hello'),
        new RstText(registrar, source, 'a'),
        new RstText(registrar, source, 'b'),
        new RstText(registrar, source, 'c'),
        new RstStrongEmphasis(registrar, source, 'World'),
    ]

    const mergedNodes = mergeSequentialTextNodes(registrar, textNodes)

    expect(mergedNodes).toHaveLength(3)
    expect(mergedNodes[0].textContent).toBe('Hello')
    expect(mergedNodes[1].textContent).toBe('abc')
    expect(mergedNodes[2].textContent).toBe('World')
    expect(mergedNodes[0].nodeType).toBe('StrongEmphasis')
    expect(mergedNodes[1].nodeType).toBe('Text')
    expect(mergedNodes[2].nodeType).toBe('StrongEmphasis')
})

test('when there are sequential non-Text tokens, it should not merge them', () => {
    const textNodes = [
        new RstText(registrar, source, 'Hello'),
        new RstStrongEmphasis(registrar, source, 'a'),
        new RstStrongEmphasis(registrar, source, 'b'),
        new RstStrongEmphasis(registrar, source, 'c'),
        new RstText(registrar, source, 'World'),
    ]

    const mergedNodes = mergeSequentialTextNodes(registrar, textNodes)

    expect(mergedNodes).toHaveLength(5)
    expect(mergedNodes[0].textContent).toBe('Hello')
    expect(mergedNodes[1].textContent).toBe('a')
    expect(mergedNodes[2].textContent).toBe('b')
    expect(mergedNodes[3].textContent).toBe('c')
    expect(mergedNodes[4].textContent).toBe('World')
    expect(mergedNodes[0].nodeType).toBe('Text')
    expect(mergedNodes[1].nodeType).toBe('StrongEmphasis')
    expect(mergedNodes[2].nodeType).toBe('StrongEmphasis')
    expect(mergedNodes[3].nodeType).toBe('StrongEmphasis')
    expect(mergedNodes[4].nodeType).toBe('Text')
})

test('when the input is an empty array, it should return an empty array', () => {
    const mergedNodes = mergeSequentialTextNodes(registrar, [])
    expect(mergedNodes).toEqual([])
})

test('when the input contains characters that need to be sanitized, it should preserve the characters', () => {
    const textNodes = [
        new RstText(registrar, source, '&'),
        new RstText(registrar, source, '<'),
        new RstText(registrar, source, '>'),
        new RstText(registrar, source, '"'),
        new RstText(registrar, source, "'"),
    ]

    const mergedNodes = mergeSequentialTextNodes(registrar, textNodes)

    expect(mergedNodes).toHaveLength(1)
    expect(mergedNodes[0].textContent).toBe('&<>"\'')
    expect(mergedNodes[0].nodeType).toBe('Text')
})
