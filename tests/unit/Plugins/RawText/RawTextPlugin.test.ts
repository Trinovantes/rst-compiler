import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when language matches generators, it only outputs raw text', () => {
    const input = `
        .. raw:: html

            Hello World
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'raw',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'html',
                    },
                ],
                rawBodyText: 'Hello World',
            },
        },
    ])

    testGenerator(input, `
        Hello World
    `, `
        Hello World
    `)
})

describe('when language does not match generators, it outputs nothing', () => {
    const input = `
        .. raw:: latex

            \\setlength{\\parindent}{0pt}
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'raw',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'latex',
                    },
                ],
                rawBodyText: '\\setlength{\\parindent}{0pt}',
            },
        },
    ])

    testGenerator(input, `
    `, `
    `)
})
