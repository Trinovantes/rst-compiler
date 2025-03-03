import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe('when Directive does not have initContent', () => {
    const input = `
        .. centered::

            hello world

            another paragraph
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'centered',
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'hello world',
                },
                {
                    type: 'Paragraph',
                    text: 'another paragraph',
                },
            ],
        },
    ])

    testGenerator(input, `
        <div class="centered">
            <p>
                hello world
            </p>

            <p>
                another paragraph
            </p>
        </div>
    `)
})

describe('when Directive has initContent, it generates initContent as new child Paragraph', () => {
    const input = `
        .. centered:: hello world

            another paragraph
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'centered',
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'hello world',
                },
                {
                    type: 'Paragraph',
                    text: 'another paragraph',
                },
            ],
        },
    ])

    testGenerator(input, `
        <div class="centered">
            <p>
                hello world
            </p>

            <p>
                another paragraph
            </p>
        </div>
    `)
})
