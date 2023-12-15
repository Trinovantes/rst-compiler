import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('decimal footnote', () => {
    const input = `
        .. [1] footnote
    `

    expectDocument(input, [
        {
            type: RstNodeType.FootNote,
            text: 'footnote',
            meta: {
                label: '1',
            },
        },
    ])
})

test('auto numbered footnote', () => {
    const input = `
        .. [#] footnote
        .. [#note] this auto label can be reused
    `

    expectDocument(input, [
        {
            type: RstNodeType.FootNote,
            text: 'footnote',
            meta: {
                label: '#',
            },
        },
        {
            type: RstNodeType.FootNote,
            text: 'this auto label can be reused',
            meta: {
                label: '#note',
            },
        },
    ])
})

test('auto symbol footnote', () => {
    const input = `
        .. [*] footnote
    `

    expectDocument(input, [
        {
            type: RstNodeType.FootNote,
            text: 'footnote',
            meta: {
                label: '*',
            },
        },
    ])
})
