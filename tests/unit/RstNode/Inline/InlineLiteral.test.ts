import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe('when InlineLiteral ends with escape slash, it parses as InlineLiteral', () => {
    const input = `
        \`\`test\\\`\`
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'InlineLiteral',
                    text: 'test\\',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            <span class="literal">test\\</span>
        </p>
    `, `
        \`test\\\`
    `)
})

describe('when InlineLiteral ends with multiple escape slashes, it parses as InlineLiteral', () => {
    const input = `
        \`\`test\\\\\`\`
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'InlineLiteral',
                    text: 'test\\\\',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            <span class="literal">test\\\\</span>
        </p>
    `, `
        \`test\\\\\`
    `)
})

describe('when InlineLiteral contains special characters, the characters are preserved', () => {
    const input = `
        The regular expression \`\`[+-]?(\\d+(\\.\\d*)?|\\.\\d+)\`\` matches
        floating-point numbers (without exponents).
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: 'The regular expression ',
                },
                {
                    type: 'InlineLiteral',
                    text: '[+-]?(\\d+(\\.\\d*)?|\\.\\d+)',
                },
                {
                    type: 'Text',
                    text: ' matches\nfloating-point numbers (without exponents).',
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            The regular expression <span class="literal">[+-]?(\\d+(\\.\\d*)?|\\.\\d+)</span> matches
            floating-point numbers (without exponents).
        </p>
    `, `
        The regular expression \`[+-]?(\\d+(\\.\\d*)?|\\.\\d+)\` matches
        floating-point numbers (without exponents).
    `)
})
