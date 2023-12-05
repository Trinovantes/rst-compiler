import { test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('when there is an indented block, it parses as blockquote', () => {
    const input = `
        paragraph

            blockquote
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote',
                },
            ],
        },
    ])
})

test('when there are nested blocks, it parses as blockquote as a child of another blockquote', () => {
    const input = `
        paragraph

            blockquote 1

                blockquote 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 1',
                },
                {
                    type: RstNodeType.Blockquote,
                    children: [
                        {
                            type: RstNodeType.Paragraph,
                            text: 'blockquote 2',
                        },
                    ],
                },
            ],
        },
    ])
})

test('when there is an attribution, it parses single attribution as last child of blockquote', () => {
    const input = `
        paragraph

            blockquote 1

            -- blockquote 1 attribution 1

            blockquote 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 1',
                },
                {
                    type: RstNodeType.BlockquoteAttribution,
                    text: 'blockquote 1 attribution 1',
                },
            ],
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 2',
                },
            ],
        },
    ])
})

test('when there is multiline attribution, it parses single attribution as last child of blockquote', () => {
    const input = `
        paragraph

            blockquote 1

            -- blockquote 1 attribution line 1
               blockquote 1 attribution line 2

            blockquote 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 1',
                },
                {
                    type: RstNodeType.BlockquoteAttribution,
                    text: 'blockquote 1 attribution line 1\nblockquote 1 attribution line 2',
                },
            ],
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 2',
                },
            ],
        },
    ])
})

test('when there are 2 attributions, it breaks into 2 blockquotes', () => {
    const input = `
        paragraph

            blockquote 1

            -- attribution 1

            -- attribution 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 1',
                },
                {
                    type: RstNodeType.BlockquoteAttribution,
                    text: 'attribution 1',
                },
            ],
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.BlockquoteAttribution,
                    text: 'attribution 2',
                },
            ],
        },
    ])
})

test('when there is an empty comment, it breaks into 2 blockquotes', () => {
    const input = `
        paragraph

            blockquote 1

        ..

            blockquote 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 1',
                },
            ],
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 2',
                },
            ],
        },
    ])
})

test('when the first line is a list character and space, it parses as bullet list inside a blockquote', () => {
    const input = `
        paragraph

            - blockquote 1 list
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.BulletList,
                    children: [
                        {
                            type: RstNodeType.ListItem,
                            text: 'blockquote 1 list',
                            meta: {
                                bullet: '-',
                            },
                        },
                    ],
                },
            ],
        },
    ])
})
