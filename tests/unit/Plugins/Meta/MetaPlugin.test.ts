import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGeneratorHeader } from 'tests/fixtures/testGenerator.js'

describe('no config', () => {
    const input = `
        .. meta::
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'meta',
            },
        },
    ])

    testGeneratorHeader(input, `
    `, `
    `)
})

describe('config with no additional attributes', () => {
    const input = `
        .. meta::
            :description: The reStructuredText plaintext markup language
            :keywords: plaintext, markup language
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'meta',
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'description',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'The reStructuredText plaintext markup language',
                                    },
                                ],
                            },
                        },
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'keywords',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'plaintext, markup language',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ])

    testGeneratorHeader(input, `
        <meta name="description" content="The reStructuredText plaintext markup language">
        <meta name="keywords" content="plaintext, markup language">
    `, `
        ---
        head:
          - - meta
            - name: description
              content: The reStructuredText plaintext markup language
          - - meta
            - name: keywords
              content: plaintext, markup language
        ---
    `)
})

describe('config with extra attributes', () => {
    const input = `
        .. meta::
            :description lang=en: An amusing story
            :description lang=fr: Une histoire amusante
            :hello world foo=bar bar=baz: content
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'meta',
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'description lang=en',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'An amusing story',
                                    },
                                ],
                            },
                        },
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'description lang=fr',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'Une histoire amusante',
                                    },
                                ],
                            },
                        },
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'hello world foo=bar bar=baz',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'content',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ])

    testGeneratorHeader(input, `
        <meta name="description" lang="en" content="An amusing story">
        <meta name="description" lang="fr" content="Une histoire amusante">
        <meta name="hello" world="" foo="bar" bar="baz" content="content">
    `, `
        ---
        head:
          - - meta
            - name: description
              lang: en
              content: An amusing story
          - - meta
            - name: description
              lang: fr
              content: Une histoire amusante
          - - meta
            - name: hello
              world:
              foo: bar
              bar: baz
              content: content
        ---
    `)
})

describe('config without name attribute', () => {
    const input = `
        .. meta::
            :http-equiv=Content-Type: text/html; charset=ISO-8859-1
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'meta',
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'http-equiv=Content-Type',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'text/html; charset=ISO-8859-1',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ])

    testGeneratorHeader(input, `
        <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
    `, `
        ---
        head:
          - - meta
            - http-equiv: Content-Type
              content: text/html; charset=ISO-8859-1
        ---
    `)
})
