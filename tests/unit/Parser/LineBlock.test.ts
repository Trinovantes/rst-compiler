import { test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('line block', () => {
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
