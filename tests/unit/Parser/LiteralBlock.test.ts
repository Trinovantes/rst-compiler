import { test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('expanded literal block', () => {
    const input = `
        paragraph:

        ::

            literal block
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph:',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: 'literal block',
        },
    ])
})

test('partially minimized form', () => {
    const input = `
        paragraph: ::

            literal block
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph:',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: 'literal block',
        },
    ])
})

test('fully minimized form', () => {
    const input = `
        paragraph::

            literal block
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph:',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: 'literal block',
        },
    ])
})

test('quoted literal block', () => {
    const input = `
        paragraph::

        >> literal block 1
        > literal block 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph:',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: '>> literal block 1\n> literal block 2',
        },
    ])
})
