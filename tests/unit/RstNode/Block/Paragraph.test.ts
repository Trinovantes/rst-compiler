import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when there is standalone text, it parses as Paragraph', () => {
    const input = `
        Hello world
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'Hello world',
        },
    ])

    testGenerator(input, `
        <p>
            Hello world
        </p>
    `, `
        Hello world
    `)
})

describe('when text is separated by multiple linebreaks, it parses as multiple Paragraphs', () => {
    const input = `
        test 1

        test 2
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'test 1',
        },
        {
            type: RstNodeType.Paragraph,
            text: 'test 2',
        },
    ])

    testGenerator(input, `
        <p>
            test 1
        </p>

        <p>
            test 2
        </p>
    `, `
        test 1

        test 2
    `)
})

describe('when text is not separated by multiple linebreaks, it parses as single Paragraph', () => {
    const input = `
        test 1
        test 2
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'test 1\ntest 2',
        },
    ])

    testGenerator(input, `
        <p>
            test 1
            test 2
        </p>
    `, `
        test 1
        test 2
    `)
})
