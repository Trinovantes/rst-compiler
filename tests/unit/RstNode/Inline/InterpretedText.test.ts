import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('with prefix role', () => {
    const input = `
        :t:\`interpreted text\`
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'InterpretedText',
                    text: 'interpreted text',
                    data: {
                        role: 't',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            <cite>interpreted text</cite>
        </p>
    `, `
        *interpreted text*
    `)
})

describe('with suffix role', () => {
    const input = `
        \`interpreted text\`:t:
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'InterpretedText',
                    text: 'interpreted text',
                    data: {
                        role: 't',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            <cite>interpreted text</cite>
        </p>
    `, `
        *interpreted text*
    `)
})
