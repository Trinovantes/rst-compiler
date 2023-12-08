import { expect, test } from 'vitest'
import { parseTestInput } from '../../../fixtures/parseTestInput.js'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('when there is only underline, it parses as single section', () => {
    const input = `
        test
        ---
    `

    expectDocument(input, [
        {
            type: RstNodeType.Section,
            text: 'test',
            meta: {
                level: 1,
            },
        },
    ])
})

test('when there are overline and underline, it parses as single section', () => {
    const input = `
        ---
        test
        ---
    `

    expectDocument(input, [
        {
            type: RstNodeType.Section,
            text: 'test',
            meta: {
                level: 1,
            },
        },
    ])
})

test('when there are multiple sections with different markers, the first section is h1 and second section is h2', () => {
    const input = `
        test1
        ---

        test2
        ===
    `

    expectDocument(input, [
        {
            type: RstNodeType.Section,
            text: 'test1',
            meta: {
                level: 1,
            },
        },
        {
            type: RstNodeType.Section,
            text: 'test2',
            meta: {
                level: 2,
            },
        },
    ])
})

test('when overline and underline do not match, it throws an error', () => {
    const input = `
        ===
        test
        ---
    `

    expect(() => parseTestInput(input)).toThrow()
})
