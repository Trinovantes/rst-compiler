import { expect, test } from 'vitest'
import { parseTestInput } from '../../fixtures/parseTestInput.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('when there is standalone text, it parses as paragraph', () => {
    const input = `
        test
    `

    const root = parseTestInput(input)

    expect(root.children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].type).toBe(RstNodeType.Text)
    expect(root.children[0].children[0].getTextContent()).toBe('test')
})

test('when text is separated by line breaks, it parses as multiple paragraphs', () => {
    const input = `
        test 1

        test 2
    `

    const root = parseTestInput(input)

    expect(root.children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[1].type).toBe(RstNodeType.Paragraph)

    expect(root.children[0].getTextContent()).toBe('test 1')
    expect(root.children[1].getTextContent()).toBe('test 2')
})

test('when text is not separated by line breaks, it parses as single paragraph', () => {
    const input = `
        test 1
        test 2
    `

    const root = parseTestInput(input)

    expect(root.children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].getTextContent()).toBe('test 1\ntest 2')
})
