import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('single line Comment', () => {
    const input = `
        .. This is a comment
    `

    testParser(input, [
        {
            type: 'Comment',
            text: 'This is a comment',
        },
    ])

    testGenerator(input, `
        <!-- This is a comment -->
    `, `
        [This is a comment]: #
    `)
})

describe('multiline Comment', () => {
    const input = `
        ..
            line 1
            line 2
    `

    testParser(input, [
        {
            type: 'Comment',
            text: 'line 1\nline 2',
        },
    ])

    testGenerator(input, `
        <!--
            line 1
            line 2
        -->
    `, `
        [line 1]: #
        [line 2]: #
    `)
})

describe('when Comment is empty, it does not generate anything', () => {
    const input = `
        ..
    `

    testParser(input, [
        {
            type: 'Comment',
            text: '',
        },
    ])

    testGenerator(input)
})

describe('when text is immediately after single line Comment, it parses as multiline Comment', () => {
    const input = `
        .. comment
           line 2
    `

    testParser(input, [
        {
            type: 'Comment',
            text: 'comment\nline 2',
        },
    ])

    testGenerator(input, `
        <!--
            comment
            line 2
        -->
    `, `
        [comment]: #
        [line 2]: #
    `)
})

describe('when text with different indentation is immediately after single line comment, it parses as multiline comment', () => {
    const input = `
        .. 1234
               line 2
    `

    testParser(input, [
        {
            type: 'Comment',
            text: '1234\n    line 2',
        },
    ])

    testGenerator(input, `
        <!--
            1234
                line 2
        -->
    `, `
        [1234]: #
        [    line 2]: #
    `)
})

describe('when multiline comment has varying indentation sizes, it should strip every line to the max common indentation', () => {
    const input = `
        ..
             34
            234
           1234
    `

    testParser(input, [
        {
            type: 'Comment',
            text: '  34\n 234\n1234',
        },
    ])

    testGenerator(input, `
        <!--
              34
             234
            1234
        -->
    `, `
        [  34]: #
        [ 234]: #
        [1234]: #
    `)
})
