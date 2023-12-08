import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('basic line block', () => {
    const input = `
        | test
    `

    expectDocument(input, [
        {
            type: RstNodeType.LineBlock,
            text: 'test',
        },
    ])
})

test('when lines are indented, the indentation is preserved', () => {
    const input = `
        | 012345
        |   0123
    `

    expectDocument(input, [
        {
            type: RstNodeType.LineBlock,
            text: '012345\n  0123',
        },
    ])
})
