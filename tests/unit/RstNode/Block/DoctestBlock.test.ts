import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when text begins with ">>>", it parses as DoctestBlock', () => {
    const input = `
        >>> test
    `

    testParser(input, [
        {
            type: RstNodeType.DoctestBlock,
            text: '>>> test',
        },
    ])

    testGenerator(input, `
        <div class="doctest">
            <pre class="code">&gt;&gt;&gt; test</pre>
        </div>
    `, `
        \`\`\`python
        >>> test
        \`\`\`
    `)
})

describe('when indented DoctestBlock is preceded by LiteralBlock marker, it parses as LiteralBlock instead', () => {
    const input = `
        The following is a literal block::

            >>> This is not recognized as a doctest block by reStructuredText
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'The following is a literal block::',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: '>>> This is not recognized as a doctest block by reStructuredText',
        },
    ])

    testGenerator(input, `
        <p>
            The following is a literal block:
        </p>

        <div class="literal-block">
            <pre class="code">&gt;&gt;&gt; This is not recognized as a doctest block by reStructuredText</pre>
        </div>
    `, `
        The following is a literal block:

        \`\`\`txt
        >>> This is not recognized as a doctest block by reStructuredText
        \`\`\`
    `)
})

describe('when indented DoctestBlock is not preceded by LiteralBlock marker, it parses as DoctestBlock inside a Blockquote', () => {
    const input = `
        paragraph

            >>> test
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
                    type: RstNodeType.DoctestBlock,
                    text: '>>> test',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            paragraph
        </p>

        <blockquote>
            <div class="doctest">
                <pre class="code">&gt;&gt;&gt; test</pre>
            </div>
        </blockquote>
    `, `
        paragraph

        > \`\`\`python
        > >>> test
        > \`\`\`
    `)
})
