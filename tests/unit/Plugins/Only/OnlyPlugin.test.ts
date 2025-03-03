import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when no env is set, it defaults to false and does not output anything', () => {
    const input = `
        .. only:: show

            Hello World
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'only',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'show',
                    },
                ],
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'Hello World',
                },
            ],
        },
    ])

    testGenerator(input, `
    `, `
    `)
})

describe('when env is set to true, it outputs the child', () => {
    const input = `
        .. only:: show

            Hello World
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'only',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'show',
                    },
                ],
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'Hello World',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            Hello World
        </p>
    `, `
        Hello World
    `, {
        generatorOptions: {
            outputEnv: {
                show: true,
            },
        },
    })
})
