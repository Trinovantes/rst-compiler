import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when there are less than 4 chars, it parses as Paragraph', () => {
    const input = `
        ---
    `

    testParser(input, [
        {
            type: 'Paragraph',
            text: '---',
        },
    ])

    testGenerator(input, `
        <p>
            ---
        </p>
    `, `
        ---
    `)
})

describe('when there are 4 characters, it parses as Transition', () => {
    const input = `
        ----
    `

    testParser(input, [
        {
            type: 'Transition',
        },
    ])

    testGenerator(input, `
        <hr />
    `, `
        ---
    `)
})

describe('when there are multiple linebreaks between Transitions, it parses as multiple Transitions', () => {
    const input = `
        ----



        ----
    `

    testParser(input, [
        {
            type: 'Transition',
        },
        {
            type: 'Transition',
        },
    ])

    testGenerator(input, `
        <hr />

        <hr />
    `, `
        ---

        ---
    `)
})
