import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe('highlight Directive changes default language of code Directive', () => {
    const input = `
        .. code::

            text 1

        .. highlight:: js

        .. code::

            text 2
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'code',
                rawBodyText: 'text 1',
            },
        },
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'highlight',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'js',
                    },
                ],
            },
        },
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'code',
                rawBodyText: 'text 2',
            },
        },
    ])

    testGenerator(input, `
        <pre class="code">text 1</pre>

        <!-- Directive id:4 children:0 directive:"highlight" initContentText:"js" -->

        <pre class="code">text 2</pre>
    `, `
        \`\`\`txt
        text 1
        \`\`\`

        [Directive id:4 children:0 directive:"highlight" initContentText:"js"]: #

        \`\`\`js
        text 2
        \`\`\`
    `)
})

describe('highlight Directive changes default language of LiteralBlock', () => {
    const input = `
        ::

            text 1

        .. highlight:: js

        ::

            text 2
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: '::',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: 'text 1',
        },
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'highlight',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'js',
                    },
                ],
            },
        },
        {
            type: RstNodeType.Paragraph,
            text: '::',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: 'text 2',
        },
    ])

    testGenerator(input, `
        <!-- :: -->

        <div class="literal-block">
            <pre class="code">text 1</pre>
        </div>

        <!-- Directive id:6 children:0 directive:"highlight" initContentText:"js" -->

        <!-- :: -->

        <div class="literal-block">
            <pre class="code">text 2</pre>
        </div>
    `, `
        [::]: #

        \`\`\`txt
        text 1
        \`\`\`

        [Directive id:6 children:0 directive:"highlight" initContentText:"js"]: #

        [::]: #

        \`\`\`js
        text 2
        \`\`\`
    `)
})
