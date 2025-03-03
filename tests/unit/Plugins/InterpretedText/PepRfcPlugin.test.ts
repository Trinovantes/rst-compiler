import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe.each([
    ['PEP', 'https://peps.python.org/pep-0123'],
    ['RFC', 'https://tools.ietf.org/html/rfc123.html'],
])('when role is :%s:', (role, url) => {
    describe(`when InterpretedText has ${role} role with number body, it parses as InterpretedText`, () => {
        const input = `
            \`123\`:${role}:
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'InterpretedText',
                        text: '123',
                        data: {
                            role,
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <p>
                <a href="${url}">${role} 123</a>
            </p>
        `, `
            [${role} 123](${url})
        `)
    })

    describe(`when InterpretedText has ${role} role with non-number body, it parses as plaintext`, () => {
        const input = `
            \`text\`:${role}:
        `

        testParser(input, [
            {
                type: 'Paragraph',
                text: `\`text\`:${role}:`,
            },
        ])

        testGenerator(input, `
            <p>
                \`text\`:${role}:
            </p>
        `, `
            \`text\`:${role}:
        `)
    })
})
