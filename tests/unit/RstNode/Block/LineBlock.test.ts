import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when text begins with "|", it parses as LineBlock', () => {
    const input = `
        paragraph

        | test
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.LineBlock,
            children: [
                {
                    type: RstNodeType.LineBlockLine,
                    text: 'test',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <div class="line-block">
            <div class="line">test</div>
        </div>
    `, `
        paragraph

        > test
    `)
})

describe('when lines are indented, the indentation is preserved as a nested LineBlock', () => {
    const input = `
        paragraph

        | 01234567
        |     0123
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.LineBlock,
            children: [
                {
                    type: RstNodeType.LineBlockLine,
                    text: '01234567',
                },
                {
                    type: RstNodeType.LineBlock,
                    children: [
                        {
                            type: RstNodeType.LineBlockLine,
                            text: '0123',
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

        <div class="line-block">
            <div class="line">01234567</div>
            <div class="line-block">
                <div class="line">0123</div>
            </div>
        </div>
    `, `
        paragraph

        > 01234567
        >
        > > 0123
    `)
})

describe('when lines are indented (in reverse), the indentation is preserved as a nested LineBlock', () => {
    const input = `
        paragraph

        |     0123
        | 01234567
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.LineBlock,
            children: [
                {
                    type: RstNodeType.LineBlock,
                    children: [
                        {
                            type: RstNodeType.LineBlockLine,
                            text: '0123',
                        },
                    ],
                },
                {
                    type: RstNodeType.LineBlockLine,
                    text: '01234567',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <div class="line-block">
            <div class="line-block">
                <div class="line">0123</div>
            </div>
            <div class="line">01234567</div>
        </div>
    `, `
        paragraph

        > > 0123
        >
        > 01234567
    `)
})

describe('when lines are separated by linebreak, the linebreak parses as an empty LineBlockLine', () => {
    const input = `
        paragraph

        | 0123
        |
        |     0123
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.LineBlock,
            children: [
                {
                    type: RstNodeType.LineBlockLine,
                    text: '0123',
                },
                {
                    type: RstNodeType.LineBlockLine,
                },
                {
                    type: RstNodeType.LineBlock,
                    children: [
                        {
                            type: RstNodeType.LineBlockLine,
                            text: '0123',
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

        <div class="line-block">
            <div class="line">0123</div>
            <div class="line"><br /></div>
            <div class="line-block">
                <div class="line">0123</div>
            </div>
        </div>
    `, `
        paragraph

        > 0123
        >
        > <br />
        >
        > > 0123
    `)
})

describe('when LineBlock is indented, it parses as LineBlock inside Blockquote', () => {
    const input = `
        Take it away, Eric the Orchestra Leader!

            | A one, two, a one two three four
            |
            | Half a bee, philosophically,
            |     must, *ipso facto*, half not be.
            | But half the bee has got to be,
            |     *vis a vis* its entity.  D'you see?
            |
            | But can a bee be said to be
            |     or not to be an entire bee,
            |         when half the bee is not a bee,
            |             due to some ancient injury?
            |
            | Singing...
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'Take it away, Eric the Orchestra Leader!',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.LineBlock,
                    children: [
                        {
                            type: RstNodeType.LineBlockLine,
                            text: 'A one, two, a one two three four',
                        },
                        {
                            type: RstNodeType.LineBlockLine,
                        },
                        {
                            type: RstNodeType.LineBlockLine,
                            text: 'Half a bee, philosophically,',
                        },
                        {
                            type: RstNodeType.LineBlock,
                            children: [
                                {
                                    type: RstNodeType.LineBlockLine,
                                    children: [
                                        {
                                            type: RstNodeType.Text,
                                            text: 'must, ',
                                        },
                                        {
                                            type: RstNodeType.Emphasis,
                                            text: 'ipso facto',
                                        },
                                        {
                                            type: RstNodeType.Text,
                                            text: ', half not be.',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            type: RstNodeType.LineBlockLine,
                            text: 'But half the bee has got to be,',
                        },
                        {
                            type: RstNodeType.LineBlock,
                            children: [
                                {
                                    type: RstNodeType.LineBlockLine,
                                    children: [
                                        {
                                            type: RstNodeType.Emphasis,
                                            text: 'vis a vis',
                                        },
                                        {
                                            type: RstNodeType.Text,
                                            text: " its entity.  D'you see?",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            type: RstNodeType.LineBlockLine,
                        },
                        {
                            type: RstNodeType.LineBlockLine,
                            text: 'But can a bee be said to be',
                        },
                        {
                            type: RstNodeType.LineBlock,
                            children: [
                                {
                                    type: RstNodeType.LineBlockLine,
                                    text: 'or not to be an entire bee,',
                                },
                                {
                                    type: RstNodeType.LineBlock,
                                    children: [
                                        {
                                            type: RstNodeType.LineBlockLine,
                                            text: 'when half the bee is not a bee,',
                                        },
                                        {
                                            type: RstNodeType.LineBlock,
                                            children: [
                                                {
                                                    type: RstNodeType.LineBlockLine,
                                                    text: 'due to some ancient injury?',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            type: RstNodeType.LineBlockLine,
                        },
                        {
                            type: RstNodeType.LineBlockLine,
                            text: 'Singing...',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            Take it away, Eric the Orchestra Leader!
        </p>

        <blockquote>
            <div class="line-block">
                <div class="line">A one, two, a one two three four</div>
                <div class="line"><br /></div>
                <div class="line">Half a bee, philosophically,</div>
                <div class="line-block">
                    <div class="line">must, <em>ipso facto</em>, half not be.</div>
                </div>
                <div class="line">But half the bee has got to be,</div>
                <div class="line-block">
                    <div class="line"><em>vis a vis</em> its entity.  D&apos;you see?</div>
                </div>
                <div class="line"><br /></div>
                <div class="line">But can a bee be said to be</div>
                <div class="line-block">
                    <div class="line">or not to be an entire bee,</div>
                    <div class="line-block">
                        <div class="line">when half the bee is not a bee,</div>
                        <div class="line-block">
                            <div class="line">due to some ancient injury?</div>
                        </div>
                    </div>
                </div>
                <div class="line"><br /></div>
                <div class="line">Singing...</div>
            </div>
        </blockquote>
    `, `
        Take it away, Eric the Orchestra Leader!

        > > A one, two, a one two three four
        > >
        > > <br />
        > >
        > > Half a bee, philosophically,
        > >
        > > > must, *ipso facto*, half not be.
        > >
        > > But half the bee has got to be,
        > >
        > > > *vis a vis* its entity.  D&apos;you see?
        > >
        > > <br />
        > >
        > > But can a bee be said to be
        > >
        > > > or not to be an entire bee,
        > > >
        > > > > when half the bee is not a bee,
        > > > >
        > > > > > due to some ancient injury?
        > >
        > > <br />
        > >
        > > Singing...
    `)
})
