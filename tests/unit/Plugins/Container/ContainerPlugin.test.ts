import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe('when Directive does not specify class, it generates generic div', () => {
    const input = `
        .. container::
        
            This paragraph is inside plain div
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'container',
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'This paragraph is inside plain div',
                },
            ],
        },
    ])

    testGenerator(input, `
        <div class="container">
            <p>
                This paragraph is inside plain div
            </p>
        </div>
    `, `
        This paragraph is inside plain div
    `)
})

describe('when Directive specifies class, it generates class in div', () => {
    const input = `
        .. container:: custom
        
            This paragraph might be rendered in a custom way.
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'container',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'custom',
                    },
                ],
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'This paragraph might be rendered in a custom way.',
                },
            ],
        },
    ])

    testGenerator(input, `
        <div class="container custom">
            <p>
                This paragraph might be rendered in a custom way.
            </p>
        </div>
    `, `
        This paragraph might be rendered in a custom way.
    `)
})
