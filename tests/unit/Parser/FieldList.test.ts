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

test('when multi line field body does align with colon, it parses as field list', () => {
    const input = `
        :key: line 1
              line 2
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
                                text: 'line 1\nline 2',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('when multi line field body does not align with colon, it parses as field list', () => {
    const input = `
        :key: line 1
          line 2
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
                                text: 'line 1\nline 2',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})
