import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe.each([
    'ab',
    'abbr',
    'abbreviation',
])('when role is :%s:', (role) => {
    describe.each<{
        testName: string
        inputText: string
        parsedText: string
        shortForm: string
        longForm?: string
    }>([
        {
            testName: 'no long form',
            inputText: 'ABC',
            parsedText: 'ABC',
            shortForm: 'ABC',
        },
        {
            testName: 'long form',
            inputText: 'RFC (Request for Comments)',
            parsedText: 'RFC (Request for Comments)',
            shortForm: 'RFC',
            longForm: 'Request for Comments',
        },
        {
            testName: 'escaped brackets do not parse as long form',
            inputText: 'RFC \\(Request for Comments)',
            parsedText: 'RFC (Request for Comments)',
            shortForm: 'RFC (Request for Comments)',
        },
    ])('$testName', ({ inputText, parsedText, shortForm, longForm }) => {
        const input = `
            :${role}:\`${inputText}\`
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'InterpretedText',
                        text: parsedText,
                        data: {
                            role,
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <p>
                <abbr${longForm ? ` title="${longForm}"` : ''}>${shortForm}</abbr>
            </p>
        `, `
            <abbr${longForm ? ` title="${longForm}"` : ''}>${shortForm}</abbr>
        `)
    })
})
