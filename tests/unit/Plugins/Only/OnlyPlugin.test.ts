import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when no env is set, it defaults to false and does not output anything', () => {
    const input = `
        .. only:: show

            Hello World
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'only',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'show',
                    },
                ],
            },
            children: [
                {
                    type: RstNodeType.Paragraph,
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
            type: RstNodeType.Directive,
            data: {
                directive: 'only',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'show',
                    },
                ],
            },
            children: [
                {
                    type: RstNodeType.Paragraph,
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
