import { describe, test } from 'vitest'
import { RstNodeType } from '@/Parser/RstNode.js'
import { expectDocument } from '../../../fixtures/expectDocument.js'

describe('bullet characters denotes start of bullet list', () => {
    test.each([
        ['-'],
        ['+'],
        ['*'],
    ])('"%s"', (bullet) => {
        const input = `
            ${bullet} bullet 1

            ${bullet} bullet 2
        `

        expectDocument(input, [
            {
                type: RstNodeType.BulletList,
                children: [
                    {
                        type: RstNodeType.BulletListItem,
                        text: 'bullet 1',
                        meta: {
                            bullet,
                        },
                    },
                    {
                        type: RstNodeType.BulletListItem,
                        text: 'bullet 2',
                        meta: {
                            bullet,
                        },
                    },
                ],
            },
        ])
    })
})

test('when there are line breaks in bullet, it parses as multiple paragraphs in same list item', () => {
    const input = `
        - paragraph 1

          paragraph 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.BulletList,
            children: [
                {
                    type: RstNodeType.BulletListItem,
                    meta: {
                        bullet: '-',
                    },
                    children: [
                        {
                            type: RstNodeType.Paragraph,
                            text: 'paragraph 1',
                        },
                        {
                            type: RstNodeType.Paragraph,
                            text: 'paragraph 2',
                        },
                    ],
                },
            ],
        },
    ])
})

test('when following line aligns with initial bullet, it parses as single paragraph in list item', () => {
    const input = `
        - sentence 1
          sentence 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.BulletList,
            children: [
                {
                    type: RstNodeType.BulletListItem,
                    text: 'sentence 1\nsentence 2',
                    meta: {
                        bullet: '-',
                    },
                },
            ],
        },
    ])
})

test('when following line aligns with initial bullet and has bullet character but does not have linebreak, it parses as same paragraph', () => {
    const input = `
        - The following line appears to be a new sublist, but it is not:
          - This is a paragraph continuation, not a sublist (since there's
          no blank line).  This line is also incorrectly indented.
          - Warnings may be issued by the implementation.
    `

    expectDocument(input, [
        {
            type: RstNodeType.BulletList,
            children: [
                {
                    type: RstNodeType.BulletListItem,
                    text: "The following line appears to be a new sublist, but it is not:\n- This is a paragraph continuation, not a sublist (since there's\nno blank line).  This line is also incorrectly indented.\n- Warnings may be issued by the implementation.",
                    meta: {
                        bullet: '-',
                    },
                },
            ],
        },
    ])
})

test('when following line does not align with initial bullet, it parses as paragraph instead of list', () => {
    const input = `
        - sentence 1
        sentence 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: '- sentence 1\nsentence 2',
        },
    ])
})

test('when following line starts with bullet with linebreak, it parses as nested list', () => {
    const input = `
        - parent list

          - child list

            - grandchild list
    `

    expectDocument(input, [
        {
            type: RstNodeType.BulletList,
            children: [
                {
                    type: RstNodeType.BulletListItem,
                    meta: {
                        bullet: '-',
                    },
                    children: [
                        {
                            type: RstNodeType.Paragraph,
                            text: 'parent list',
                        },
                        {
                            type: RstNodeType.BulletList,
                            children: [
                                {
                                    type: RstNodeType.BulletListItem,
                                    meta: {
                                        bullet: '-',
                                    },
                                    children: [
                                        {
                                            type: RstNodeType.Paragraph,
                                            text: 'child list',
                                        },
                                        {
                                            type: RstNodeType.BulletList,
                                            children: [
                                                {
                                                    type: RstNodeType.BulletListItem,
                                                    text: 'grandchild list',
                                                    meta: {
                                                        bullet: '-',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ])
})

test('when multiple lines start with bullets with same indent, it parses as separate nested lists', () => {
    const input = `
        - parent list

          - child 1 list

            - child 1 grandchild list

          - child 2 list

            - child 2 grandchild list
    `

    expectDocument(input, [
        {
            type: RstNodeType.BulletList,
            children: [
                {
                    type: RstNodeType.BulletListItem,
                    meta: {
                        bullet: '-',
                    },
                    children: [
                        {
                            type: RstNodeType.Paragraph,
                            text: 'parent list',
                        },
                        {
                            type: RstNodeType.BulletList,
                            children: [
                                {
                                    type: RstNodeType.BulletListItem,
                                    meta: {
                                        bullet: '-',
                                    },
                                    children: [
                                        {
                                            type: RstNodeType.Paragraph,
                                            text: 'child 1 list',
                                        },
                                        {
                                            type: RstNodeType.BulletList,
                                            children: [
                                                {
                                                    type: RstNodeType.BulletListItem,
                                                    text: 'child 1 grandchild list',
                                                    meta: {
                                                        bullet: '-',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    type: RstNodeType.BulletListItem,
                                    meta: {
                                        bullet: '-',
                                    },
                                    children: [
                                        {
                                            type: RstNodeType.Paragraph,
                                            text: 'child 2 list',
                                        },
                                        {
                                            type: RstNodeType.BulletList,
                                            children: [
                                                {
                                                    type: RstNodeType.BulletListItem,
                                                    text: 'child 2 grandchild list',
                                                    meta: {
                                                        bullet: '-',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ])
})
