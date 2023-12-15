import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('simple directive', () => {
    const input = `
        .. image:: mylogo.jpeg
    `

    expectDocument(input, [
        {
            type: RstNodeType.Directive,
            meta: {
                directive: 'image',
                data: 'mylogo.jpeg',
            },
        },
    ])
})

test('multi-part directive', () => {
    const input = `
        .. figure:: larch.png
           :scale: 50
        
           The larch.
    `

    expectDocument(input, [
        {
            type: RstNodeType.Directive,
            meta: {
                directive: 'figure',
                data: 'larch.png',
            },
            children: [
                {
                    type: RstNodeType.FieldList,
                    children: [
                        {
                            type: RstNodeType.FieldListItem,
                            meta: {
                                name: 'scale',
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: '50',
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    type: RstNodeType.Paragraph,
                    text: 'The larch.',
                },
            ],
        },
    ])
})
