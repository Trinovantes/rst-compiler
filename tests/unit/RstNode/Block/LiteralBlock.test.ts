import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('LiteralBlock', () => {
    describe('expanded form', () => {
        const input = `
            paragraph:

            ::

                literal block
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                text: 'paragraph:',
            },
            {
                type: RstNodeType.Paragraph,
                text: '::',
            },
            {
                type: RstNodeType.LiteralBlock,
                text: 'literal block',
            },
        ])

        testGenerator(input, `
            <p>
                paragraph:
            </p>

            <!-- :: -->

            <div class="literal-block">
                <pre class="code">literal block</pre>
            </div>
        `, `
            paragraph:

            [::]: #

            \`\`\`txt
            literal block
            \`\`\`
        `)
    })

    describe('partially minimized form', () => {
        const input = `
            paragraph: ::

                literal block
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                text: 'paragraph: ::',
            },
            {
                type: RstNodeType.LiteralBlock,
                text: 'literal block',
            },
        ])
    })

    describe('fully minimized form', () => {
        const input = `
            paragraph::

                literal block
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                text: 'paragraph::',
            },
            {
                type: RstNodeType.LiteralBlock,
                text: 'literal block',
            },
        ])
    })

    describe('quoted form', () => {
        const input = `
            paragraph::

            >> literal block 1
            > literal block 2
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                text: 'paragraph::',
            },
            {
                type: RstNodeType.LiteralBlock,
                text: '>> literal block 1\n> literal block 2',
            },
        ])
    })
})

describe('when LiteralBlock has linebreaks, it preserves linebreaks', () => {
    const input = `
        paragraph::

            line 1

            line 2
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph::',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: 'line 1\n\nline 2',
        },
    ])

    testGenerator(input, `
        <p>
            paragraph:
        </p>

        <div class="literal-block">
            <pre class="code">line 1

        line 2</pre>
        </div>
    `, `
        paragraph:

        \`\`\`txt
        line 1

        line 2
        \`\`\`
    `)
})

describe('when prev Paragraph ends with non-Text node, it parses as LiteralBlock', () => {
    const input = `
        *paragraph::*

            not literal block
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.Emphasis,
                    text: 'paragraph::',
                },
            ],
        },
        {
            type: RstNodeType.Blockquote,
            text: 'not literal block',
        },
    ])

    testGenerator(input, `
        <p>
            <em>paragraph::</em>
        </p>

        <blockquote>
            <p>
                not literal block
            </p>
        </blockquote>
    `, `
        *paragraph::*

        > not literal block
    `)
})

describe('when Paragraph with :: is last child, it parses as normal paragraph (outputs "::" intact)', () => {
    const input = `
        paragraph::
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph::',
        },
    ])

    testGenerator(input, `
        <p>
            paragraph::
        </p>
    `, `
        paragraph::
    `)
})

describe('when Paragraph with :: is followed by non-indented text, it parses as normal Paragraph (outputs "::" intact)', () => {
    const input = `
        paragraph::

        not literal block
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph::',
        },
        {
            type: RstNodeType.Paragraph,
            text: 'not literal block',
        },
    ])

    testGenerator(input, `
        <p>
            paragraph::
        </p>

        <p>
            not literal block
        </p>
    `, `
        paragraph::

        not literal block
    `)
})

describe('when LiteralBlock has multiline text, it preserves linebreaks', () => {
    const input = `
        paragraph

        ::

            for a in [5,4,3,2,1]:   # this is program code, shown as-is
                print a
            print "it's..."
            # a literal block continues until the indentation ends
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Paragraph,
            text: '::',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: 'for a in [5,4,3,2,1]:   # this is program code, shown as-is\n    print a\nprint "it\'s..."\n# a literal block continues until the indentation ends',
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <!-- :: -->

        <div class="literal-block">
            <pre class="code">for a in [5,4,3,2,1]:   # this is program code, shown as-is
            print a
        print &quot;it&apos;s...&quot;
        # a literal block continues until the indentation ends</pre>
        </div>
    `, `
        paragraph

        [::]: #

        \`\`\`txt
        for a in [5,4,3,2,1]:   # this is program code, shown as-is
            print a
        print "it's..."
        # a literal block continues until the indentation ends
        \`\`\`
    `)
})
