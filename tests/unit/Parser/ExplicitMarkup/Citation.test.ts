import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('citation', () => {
    const input = `
        .. [label] citation
    `

    expectDocument(input, [
        {
            type: RstNodeType.Citation,
            text: 'citation',
            meta: {
                label: 'label',
            },
        },
    ])
})
