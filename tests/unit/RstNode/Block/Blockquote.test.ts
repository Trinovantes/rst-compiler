import { describe } from 'vitest'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when text is indented, it parses as Blockquote', () => {
    const input = `
        paragraph

            blockquote
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            text: 'blockquote',
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <p>
                blockquote
            </p>
        </blockquote>
    `, `
        paragraph

        > blockquote
    `)
})

describe('when there are nested indentation, it parses as nested Blockquotes', () => {
    const input = `
        paragraph

            blockquote 1

                blockquote 2
    `

    testParser(input, [
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
                    text: 'blockquote 2',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <p>
                blockquote 1
            </p>
            
            <blockquote>
                <p>
                    blockquote 2
                </p>
            </blockquote>
        </blockquote>
    `, `
        paragraph

        > blockquote 1
        >
        > > blockquote 2
    `)
})

describe('when there are out-of-order indentation, it parses as nested Blockquotes', () => {
    const input = `
        paragraph

                blockquote 2

            blockquote 1
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Blockquote,
                    text: 'blockquote 2',
                },
                {
                    type: RstNodeType.Paragraph,
                    text: 'blockquote 1',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <blockquote>
                <p>
                    blockquote 2
                </p>
            </blockquote>

            <p>
                blockquote 1
            </p>
        </blockquote>
    `, `
        paragraph

        > > blockquote 2
        >
        > blockquote 1
    `)
})

describe('when Blockquote text begins with "--", it parses as BlockquoteAttribution and terminates the Blockquote', () => {
    const input = `
        paragraph

            blockquote 1

            -- blockquote 1 attribution 1

            blockquote 2
    `

    testParser(input, [
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
            text: 'blockquote 2',
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <p>
                blockquote 1
            </p>

            <footer>
                <cite>
                    &mdash; blockquote 1 attribution 1
                </cite>
            </footer>
        </blockquote>

        <blockquote>
            <p>
                blockquote 2
            </p>
        </blockquote>
    `, `
        paragraph

        > blockquote 1
        >
        > --- blockquote 1 attribution 1

        > blockquote 2
    `)
})

describe('when there is multiline BlockquoteAttribution, it parses single BlockquoteAttribution', () => {
    const input = `
        paragraph

            blockquote 1

            -- blockquote 1 attribution line 1
               blockquote 1 attribution line 2

            blockquote 2
    `

    testParser(input, [
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
            text: 'blockquote 2',
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <p>
                blockquote 1
            </p>

            <footer>
                <cite>
                    &mdash; blockquote 1 attribution line 1
                    blockquote 1 attribution line 2
                </cite>
            </footer>
        </blockquote>
            
        <blockquote>
            <p>
                blockquote 2
            </p>
        </blockquote>
    `, `
        paragraph

        > blockquote 1
        >
        > --- blockquote 1 attribution line 1
        > blockquote 1 attribution line 2

        > blockquote 2
    `)
})

describe('when there are consecutive BlockquoteAttributions, it parses as 2 Blockquotes', () => {
    const input = `
        paragraph

            blockquote 1

            -- attribution 1

            -- attribution 2
    `

    testParser(input, [
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

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <p>
                blockquote 1
            </p>

            <footer>
                <cite>
                    &mdash; attribution 1
                </cite>
            </footer>
        </blockquote>
            
        <blockquote>
            <footer>
                <cite>
                    &mdash; attribution 2
                </cite>
            </footer>
        </blockquote>
    `, `
        paragraph

        > blockquote 1
        >
        > --- attribution 1

        > --- attribution 2
    `)
})

describe('when there is an empty Comment, it parses as 2 Blockquotes', () => {
    const input = `
        paragraph

            blockquote 1

        ..

            blockquote 2
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            text: 'blockquote 1',
        },
        {
            type: RstNodeType.Blockquote,
            text: 'blockquote 2',
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <p>
                blockquote 1
            </p>
        </blockquote>
            
        <blockquote>
            <p>
                blockquote 2
            </p>
        </blockquote>
    `, `
        paragraph

        > blockquote 1

        > blockquote 2
    `)
})

describe('when the first line of Blockquote starts a BulletList, it parses as a BulletList inside Blockquote', () => {
    const input = `
        paragraph

            - blockquote 1 list
    `

    testParser(input, [
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
                            type: RstNodeType.BulletListItem,
                            text: 'blockquote 1 list',
                            data: {
                                bullet: '-',
                            },
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <ul>
                <li>
                    <p>
                        blockquote 1 list
                    </p>
                </li>
            </ul>
        </blockquote>
    `, `
        paragraph

        > - blockquote 1 list
    `)
})

describe('when the first line of Blockquote indicates a LiteralBlock, it parses as LiteralBlock inside a Blockquote', () => {
    const input = `
        paragraph

            the following is a literal block::

                literal\\
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'the following is a literal block::',
                },
                {
                    type: RstNodeType.LiteralBlock,
                    text: 'literal\\',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <p>
                the following is a literal block:
            </p>

            <div class="literal-block">
                <pre class="code">literal\\</pre>
            </div>
        </blockquote>
    `, `
        paragraph

        > the following is a literal block:
        >
        > \`\`\`txt
        > literal\\
        > \`\`\`
    `)
})
