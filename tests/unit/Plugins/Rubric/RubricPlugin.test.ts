import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when heading-level is not specified, it defaults to 1', () => {
    const input = `
        .. rubric:: Hello World
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'rubric',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'Hello World',
                    },
                ],
            },
        },
    ])

    testGenerator(input, `
        <h1>
            Hello World
        </h1>
    `, `
        # Hello World
    `)
})

describe('when heading-level is specified, it uses user-defined level', () => {
    const input = `
        .. rubric:: Hello World
           :heading-level: 3
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'rubric',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'Hello World',
                    },
                ],
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'heading-level',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: '3',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ])

    testGenerator(input, `
        <h3>
            Hello World
        </h3>
    `, `
        ### Hello World
    `)
})
