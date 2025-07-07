import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when text is has underline, it parses as Section', () => {
    const input = `
        test
        ---
    `

    testParser(input, [
        {
            type: 'Section',
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
            type: 'Section',
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
            type: 'Section',
            text: 'test1',
            data: {
                level: 1,
            },
        },
        {
            type: 'Section',
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

describe('when multiple Sections resolve to same candidate name, it appends counter to the candidate until it is unique', () => {
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
            type: 'Section',
            text: 'introduction',
            data: {
                level: 1,
            },
        },
        {
            type: 'Section',
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

        <h1 id="introduction-1">
            Introduction
        </h1>
    `, `
        # introduction {#introduction}

        # Introduction {#introduction-1}
    `)
})

describe('when multiple Sections resolve to different candidate names but same sanitized name (html id), it generates another unique html id', () => {
    const input = `
        2D
        ---

        3D
        ---
    `

    testParser(input, [
        {
            type: 'Section',
            text: '2D',
            data: {
                level: 1,
            },
        },
        {
            type: 'Section',
            text: '3D',
            data: {
                level: 1,
            },
        },
    ])

    testGenerator(input, `
        <h1 id="d">
            2D
        </h1>

        <h1 id="id1">
            3D
        </h1>
    `, `
        # 2D {#d}

        # 3D {#id1}
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
            type: 'Paragraph',
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
