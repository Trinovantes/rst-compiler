import { expect, test } from 'vitest'
import { parseTestInput } from './parseTestInput.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('when there are less than 4 characters, it parses as normal paragraph', () => {
    const input = `
        ---
    `

    const root = parseTestInput(input)
    expect(root.children[0].type).toBe(RstNodeType.Paragraph)
})

test('when there are 4 characters between paragraphs, it parses as transition', () => {
    const input = `
        text 1

        ----

        text 2
    `

    const root = parseTestInput(input)
    expect(root.children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[1].type).toBe(RstNodeType.Transition)
    expect(root.children[2].type).toBe(RstNodeType.Paragraph)
})

test('when there are multiple section markers separated by linebreaks, it parses as multiple transitions', () => {
    const input = `
        ----

        ----
    `

    const root = parseTestInput(input)
    expect(root.children[0].type).toBe(RstNodeType.Transition)
    expect(root.children[1].type).toBe(RstNodeType.Transition)
})
