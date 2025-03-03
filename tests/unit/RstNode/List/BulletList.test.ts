import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when text begins with a bullet character and space, it parses as BulletList', () => {
    describe.each([
        ['-'],
        ['+'],
        ['*'],
    ])('"%s"', (bullet) => {
        const input = `
            ${bullet} bullet 1

            ${bullet} bullet 2
        `

        testParser(input, [
            {
                type: 'BulletList',
                children: [
                    {
                        type: 'BulletListItem',
                        text: 'bullet 1',
                        data: {
                            bullet,
                        },
                    },
                    {
                        type: 'BulletListItem',
                        text: 'bullet 2',
                        data: {
                            bullet,
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <ul>
                <li>
                    <p>
                        bullet 1
                    </p>
                </li>

                <li>
                    <p>
                        bullet 2
                    </p>
                </li>
            </ul>
        `, `
            ${bullet} bullet 1

            ${bullet} bullet 2
        `)
    })
})

describe('when there are no linebreaks between bullets, it still parses as BulletList', () => {
    const input = `
        - bullet 1
        - bullet 2
    `

    testParser(input, [
        {
            type: 'BulletList',
            children: [
                {
                    type: 'BulletListItem',
                    text: 'bullet 1',
                    data: {
                        bullet: '-',
                    },
                },
                {
                    type: 'BulletListItem',
                    text: 'bullet 2',
                    data: {
                        bullet: '-',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <ul>
            <li>
                <p>
                    bullet 1
                </p>
            </li>

            <li>
                <p>
                    bullet 2
                </p>
            </li>
        </ul>
    `, `
        - bullet 1

        - bullet 2
    `)
})

describe('when there are linebreaks in bullet, it parses as multiple Paragraphs in same BulletListItem', () => {
    const input = `
        - paragraph 1

          paragraph 2
    `

    testParser(input, [
        {
            type: 'BulletList',
            children: [
                {
                    type: 'BulletListItem',
                    data: {
                        bullet: '-',
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'paragraph 1',
                        },
                        {
                            type: 'Paragraph',
                            text: 'paragraph 2',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <ul>
            <li>
                <p>
                    paragraph 1
                </p>

                <p>
                    paragraph 2
                </p>
            </li>
        </ul>
    `, `
        - paragraph 1

          paragraph 2
    `)
})

describe('when next line aligns with initial bullet, it parses as single Paragraph in BulletListItem', () => {
    const input = `
        - sentence 1
          sentence 2
    `

    testParser(input, [
        {
            type: 'BulletList',
            children: [
                {
                    type: 'BulletListItem',
                    text: 'sentence 1\nsentence 2',
                    data: {
                        bullet: '-',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <ul>
            <li>
                <p>
                    sentence 1
                    sentence 2
                </p>
            </li>
        </ul>
    `, `
        - sentence 1
          sentence 2
    `)
})

describe('when next line aligns with initial bullet and starts with bullet character, it parses as same Paragraph in BulletListItem', () => {
    const input = `
        - The following line appears to be a new sublist, but it is not:
          - This is a paragraph continuation, not a sublist (since there's
          no blank line).  This line is also incorrectly indented.
          - Warnings may be issued by the implementation.
    `

    testParser(input, [
        {
            type: 'BulletList',
            children: [
                {
                    type: 'BulletListItem',
                    text: 'The following line appears to be a new sublist, but it is not:\n- This is a paragraph continuation, not a sublist (since there\'s\nno blank line).  This line is also incorrectly indented.\n- Warnings may be issued by the implementation.',
                    data: {
                        bullet: '-',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <ul>
            <li>
                <p>
                    The following line appears to be a new sublist, but it is not:
                    - This is a paragraph continuation, not a sublist (since there&apos;s
                    no blank line).  This line is also incorrectly indented.
                    - Warnings may be issued by the implementation.
                </p>
            </li>
        </ul>
    `, `
        - The following line appears to be a new sublist, but it is not:
          - This is a paragraph continuation, not a sublist (since there&apos;s
          no blank line).  This line is also incorrectly indented.
          - Warnings may be issued by the implementation.
    `)
})

describe('when next line does not align with initial bullet, it parses as Paragraph instead of BulletList', () => {
    const input = `
        - sentence 1
        sentence 2
    `

    testParser(input, [
        {
            type: 'Paragraph',
            text: '- sentence 1\nsentence 2',
        },
    ])

    testGenerator(input, `
        <p>
            - sentence 1
            sentence 2
        </p>
    `, `
        - sentence 1
        sentence 2
    `)
})

describe('when next sibling starts with bullet character, it parses as nested BulletList', () => {
    const input = `
        - parent list

          - child list

            - grandchild list
    `

    testParser(input, [
        {
            type: 'BulletList',
            children: [
                {
                    type: 'BulletListItem',
                    data: {
                        bullet: '-',
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'parent list',
                        },
                        {
                            type: 'BulletList',
                            children: [
                                {
                                    type: 'BulletListItem',
                                    data: {
                                        bullet: '-',
                                    },
                                    children: [
                                        {
                                            type: 'Paragraph',
                                            text: 'child list',
                                        },
                                        {
                                            type: 'BulletList',
                                            children: [
                                                {
                                                    type: 'BulletListItem',
                                                    text: 'grandchild list',
                                                    data: {
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

    testGenerator(input, `
        <ul>
            <li>
                <p>
                    parent list
                </p>

                <ul>
                    <li>
                        <p>
                            child list
                        </p>

                        <ul>
                            <li>
                                <p>
                                    grandchild list
                                </p>
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
    `, `
        - parent list

          - child list

            - grandchild list
    `)
})

describe('when multiple lines start with bullet characters with same indent, it parses as separate nested BulletList', () => {
    const input = `
        - parent list

          - child 1 list

            - child 1 grandchild list

          - child 2 list

            - child 2 grandchild list
    `

    testParser(input, [
        {
            type: 'BulletList',
            children: [
                {
                    type: 'BulletListItem',
                    data: {
                        bullet: '-',
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'parent list',
                        },
                        {
                            type: 'BulletList',
                            children: [
                                {
                                    type: 'BulletListItem',
                                    data: {
                                        bullet: '-',
                                    },
                                    children: [
                                        {
                                            type: 'Paragraph',
                                            text: 'child 1 list',
                                        },
                                        {
                                            type: 'BulletList',
                                            children: [
                                                {
                                                    type: 'BulletListItem',
                                                    text: 'child 1 grandchild list',
                                                    data: {
                                                        bullet: '-',
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    type: 'BulletListItem',
                                    data: {
                                        bullet: '-',
                                    },
                                    children: [
                                        {
                                            type: 'Paragraph',
                                            text: 'child 2 list',
                                        },
                                        {
                                            type: 'BulletList',
                                            children: [
                                                {
                                                    type: 'BulletListItem',
                                                    text: 'child 2 grandchild list',
                                                    data: {
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

    testGenerator(input, `
        <ul>
            <li>
                <p>
                    parent list
                </p>

                <ul>
                    <li>
                        <p>
                            child 1 list
                        </p>

                        <ul>
                            <li>
                                <p>
                                    child 1 grandchild list
                                </p>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <p>
                            child 2 list
                        </p>

                        <ul>
                            <li>
                                <p>
                                    child 2 grandchild list
                                </p>
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
    `, `
        - parent list

          - child 1 list

            - child 1 grandchild list

          - child 2 list

            - child 2 grandchild list
    `)
})

describe('when first line of list is indented, it parses as BulletList inside Blockquote', () => {
    const input = `
        Paragraph

            - List Line 1
              List Line 2

              - Sub-list
    `

    testParser(input, [
        {
            type: 'Paragraph',
            text: 'Paragraph',
        },
        {
            type: 'Blockquote',
            children: [
                {
                    type: 'BulletList',
                    children: [
                        {
                            type: 'BulletListItem',
                            data: {
                                bullet: '-',
                            },
                            children: [
                                {
                                    type: 'Paragraph',
                                    text: 'List Line 1\nList Line 2',
                                },
                                {
                                    type: 'BulletList',
                                    children: [
                                        {
                                            type: 'BulletListItem',
                                            text: 'Sub-list',
                                            data: {
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
    ])

    testGenerator(input, `
        <p>
            Paragraph
        </p>

        <blockquote>
            <ul>
                <li>
                    <p>
                        List Line 1
                        List Line 2
                    </p>

                    <ul>
                        <li>
                            <p>
                                Sub-list
                            </p>
                        </li>
                    </ul>
                </li>
            </ul>
        </blockquote>
    `, `
        Paragraph

        > - List Line 1
        >   List Line 2
        >
        >   - Sub-list
    `)
})

describe('when first child of list is another list, it parses as BulletList inside BulletListItem', () => {
    const input = `
        * - Tag
          - Example

        * - | **b**
            | Makes \`\`{text}\`\` use the bold (or bold italics) font of \`\`RichTextLabel\`\`.

          - \`\`[b]{text}[/b]\`\`
    `

    testParser(input, [
        {
            type: 'BulletList',
            children: [
                {
                    type: 'BulletListItem',
                    data: {
                        bullet: '*',
                    },
                    children: [
                        {
                            type: 'BulletList',
                            children: [
                                {
                                    type: 'BulletListItem',
                                    text: 'Tag',
                                    data: {
                                        bullet: '-',
                                    },
                                },
                                {
                                    type: 'BulletListItem',
                                    text: 'Example',
                                    data: {
                                        bullet: '-',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    type: 'BulletListItem',
                    data: {
                        bullet: '*',
                    },
                    children: [
                        {
                            type: 'BulletList',
                            children: [
                                {
                                    type: 'BulletListItem',
                                    data: {
                                        bullet: '-',
                                    },
                                    children: [
                                        {
                                            type: 'LineBlock',
                                            children: [
                                                {
                                                    type: 'LineBlockLine',
                                                    children: [
                                                        {
                                                            type: 'StrongEmphasis',
                                                            text: 'b',
                                                        },
                                                    ],
                                                },
                                                {
                                                    type: 'LineBlockLine',
                                                    children: [
                                                        {
                                                            type: 'Text',
                                                            text: 'Makes ',
                                                        },
                                                        {
                                                            type: 'InlineLiteral',
                                                            text: '{text}',
                                                        },
                                                        {
                                                            type: 'Text',
                                                            text: ' use the bold (or bold italics) font of ',
                                                        },
                                                        {
                                                            type: 'InlineLiteral',
                                                            text: 'RichTextLabel',
                                                        },
                                                        {
                                                            type: 'Text',
                                                            text: '.',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    type: 'BulletListItem',
                                    data: {
                                        bullet: '-',
                                    },
                                    children: [
                                        {
                                            type: 'Paragraph',
                                            children: [
                                                {
                                                    type: 'InlineLiteral',
                                                    text: '[b]{text}[/b]',
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

    testGenerator(input, `
        <ul>
            <li>
                <ul>
                    <li>
                        <p>
                            Tag
                        </p>
                    </li>

                    <li>
                        <p>
                            Example
                        </p>
                    </li>
                </ul>
            </li>

            <li>
                <ul>
                    <li>
                        <div class="line-block">
                            <div class="line"><strong>b</strong></div>
                            <div class="line">Makes <span class="literal">{text}</span> use the bold (or bold italics) font of <span class="literal">RichTextLabel</span>.</div>
                        </div>
                    </li>

                    <li>
                        <p>
                            <span class="literal">[b]{text}[/b]</span>
                        </p>
                    </li>
                </ul>
            </li>
        </ul>
    `, `
        * - Tag

          - Example

        * - > **b**
            >
            > Makes \`{text}\` use the bold (or bold italics) font of \`RichTextLabel\`.

          - \`[b]{text}[/b]\`
    `)
})
