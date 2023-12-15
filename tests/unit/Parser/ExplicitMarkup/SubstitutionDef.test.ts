import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('text substitution def', () => {
    const input = `
        .. |RST| replace:: reStructuredText
    `

    expectDocument(input, [
        {
            type: RstNodeType.SubstitutionDef,
            meta: {
                directive: 'replace',
                needle: 'RST',
                data: 'reStructuredText',
            },
        },
    ])
})

test('text substitution def with multiple lines', () => {
    const input = `
        .. |j2ee-cas| replace::
           the Java \`TM\`:super: 2 Platform, Enterprise Edition Client
           Access Services
    `

    expectDocument(input, [
        {
            type: RstNodeType.SubstitutionDef,
            meta: {
                directive: 'replace',
                needle: 'j2ee-cas',
                data: '',
            },
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'the Java `TM`:super: 2 Platform, Enterprise Edition Client\nAccess Services',
                },
            ],
        },
    ])
})

test('image substitution def', () => {
    const input = `
        .. |H| image:: /images/heart.png
           :height: 11
           :width: 11
    `

    expectDocument(input, [
        {
            type: RstNodeType.SubstitutionDef,
            meta: {
                directive: 'image',
                needle: 'H',
                data: '/images/heart.png',
            },
            children: [
                {
                    type: RstNodeType.FieldList,
                    children: [
                        {
                            type: RstNodeType.FieldListItem,
                            meta: {
                                name: 'height',
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: '11',
                                    },
                                ],
                            },
                        },
                        {
                            type: RstNodeType.FieldListItem,
                            meta: {
                                name: 'width',
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: '11',
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    ])
})
