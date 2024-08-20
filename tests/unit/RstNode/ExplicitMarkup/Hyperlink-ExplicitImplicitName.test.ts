import { RstNodeType } from '@/index.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe('when there is node with implicit name same as HyperlinkTarget, the HyperlinkTarget takes priority', () => {
    const input = `
        .. _foo: https://google.ca

        Foo
        ---

        Go to foo_
    `

    testParser(input, [
        {
            type: RstNodeType.HyperlinkTarget,
            data: {
                label: 'foo',
                target: 'https://google.ca',
            },
        },
        {
            type: RstNodeType.Section,
            text: 'Foo',
            data: {
                level: 1,
            },
        },
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.Text,
                    text: 'Go to ',
                },
                {
                    type: RstNodeType.HyperlinkRef,
                    text: 'foo',
                    data: {
                        isAlias: true,
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <!-- HyperlinkTarget id:1 children:0 label:"foo" target:"https://google.ca" resolvedUrl:"https://google.ca" -->

        <h1 id="foo">
            Foo
        </h1>

        <p>
            Go to <a href="https://google.ca">foo</a>
        </p>
    `, `
        [HyperlinkTarget id:1 children:0 label:"foo" target:"https://google.ca" resolvedUrl:"https://google.ca"]: #

        # Foo {#foo}

        Go to [foo](https://google.ca)
    `)
})
