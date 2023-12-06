import { test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('basic field list', () => {
    const input = `
        :key: value
    `

    expectDocument(input, [
        {
            type: RstNodeType.FieldList,
            children: [
                {
                    type: RstNodeType.FieldListItem,
                    meta: {
                        name: 'key',
                        body: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'value',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})
