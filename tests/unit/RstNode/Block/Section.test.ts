import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when text is has underline, it parses as Section', () => {
    const input = `
        test
        ---
    `

    testParser(input, [
        {
            type: RstNodeType.Section,
            text: 'test',
            data: {
                level: 1,
            },
        },
    ])

    testGenerator(input, `
        <h1 id="test">
            test
        </h1>
    `, `
        # test {#test}
    `)
})

describe('when text has overline and underline, it parses as Section', () => {
    const input = `
        ---
        test
        ---
    `

    testParser(input, [
        {
            type: RstNodeType.Section,
            text: 'test',
            data: {
                level: 1,
            },
        },
    ])

    testGenerator(input, `
        <h1 id="test">
            test
        </h1>
    `, `
        # test {#test}
    `)
})

describe('when there are multiple Sections with different markers, the first Section is h1 and second Section is h2', () => {
    const input = `
        test1
        ---

        test2
        ===
    `

    testParser(input, [
        {
            type: RstNodeType.Section,
            text: 'test1',
            data: {
                level: 1,
            },
        },
        {
            type: RstNodeType.Section,
            text: 'test2',
            data: {
                level: 2,
            },
        },
    ])

    testGenerator(input, `
        <h1 id="test1">
            test1
        </h1>

        <h2 id="test2">
            test2
        </h2>
    `, `
        # test1 {#test1}

        ## test2 {#test2}
    `)
})

describe('when there are multiple Sections with same normalized id, it generates first Section\'s id based on text and second Section\'s id based on node', () => {
    const input = `
        ---
        introduction
        ---

        ---
        Introduction
        ---
    `

    testParser(input, [
        {
            type: RstNodeType.Section,
            text: 'introduction',
            data: {
                level: 1,
            },
        },
        {
            type: RstNodeType.Section,
            text: 'Introduction',
            data: {
                level: 1,
            },
        },
    ])

    testGenerator(input, `
        <h1 id="introduction">
            introduction
        </h1>

        <h1 id="section-2">
            Introduction
        </h1>
    `, `
        # introduction {#introduction}

        # Introduction {#section-2}
    `)
})

describe('when overline and underline do not match, it parses as Paragraph', () => {
    const input = `
        ===
        test
        ---
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            text: '===\ntest\n---',
        },
    ])

    testGenerator(input, `
        <p>
            ===
            test
            ---
        </p>
    `, `
        ===
        test
        ---
    `)
})
