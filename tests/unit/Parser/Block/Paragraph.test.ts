import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('when there is standalone text, it parses as paragraph', () => {
    const input = `
        test
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'test',
        },
    ])
})

test('when text is separated by line breaks, it parses as multiple paragraphs', () => {
    const input = `
        test 1

        test 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'test 1',
        },
        {
            type: RstNodeType.Paragraph,
            text: 'test 2',
        },
    ])
})

test('when text is not separated by line breaks, it parses as single paragraph', () => {
    const input = `
        test 1
        test 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'test 1\ntest 2',
        },
    ])
})
