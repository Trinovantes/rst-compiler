import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('when there are less than 4 characters, it parses as normal paragraph', () => {
    const input = `
        ---
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: '---',
        },
    ])
})

test('when there are 4 characters between paragraphs, it parses as transition', () => {
    const input = `
        text 1

        ----

        text 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'text 1',
        },
        {
            type: RstNodeType.Transition,
        },
        {
            type: RstNodeType.Paragraph,
            text: 'text 2',
        },
    ])
})

test('when there are section markers separated by multiple linebreaks, it parses as multiple transitions', () => {
    const input = `
        ----


        ----
    `

    expectDocument(input, [
        {
            type: RstNodeType.Transition,
        },
        {
            type: RstNodeType.Transition,
        },
    ])
})
