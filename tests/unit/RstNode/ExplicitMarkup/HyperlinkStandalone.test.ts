import { RstNodeObject } from '@/RstNode/RstNode.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe('Standalone HyperlinkRef', () => {
    describe.each<{
        testName: string
        inputUrl: string
        expectedLabel?: string
        expectedUrl?: string
    }>([
        {
            testName: 'https url',
            inputUrl: 'https://www.python.org',
        },
        {
            testName: 'https url',
            inputUrl: 'https://www.python.org',
        },
        {
            testName: 'ftp url',
            inputUrl: 'ftp://ftp.python.org/pub/python',
        },
        {
            testName: 'mailto url',
            inputUrl: 'mailto:someone@somewhere.com',
            expectedLabel: 'someone@somewhere.com',
        },
        {
            testName: 'opaque identifier',
            inputUrl: 'news:comp.lang.python',
        },
        {
            testName: 'standalone email',
            inputUrl: 'someone@somewhere.com',
            expectedUrl: 'mailto:someone@somewhere.com',
        },
        {
            testName: 'escaped characters',
            inputUrl: 'https://fakeurl\\*withstar.com',
            expectedLabel: 'https://fakeurl*withstar.com',
            expectedUrl: 'https://fakeurl*withstar.com',
        },
        {
            testName: 'url containing @',
            inputUrl: 'https://john.doe@www.example.com:123/forum/questions/?tag=networking&order=newest#top',
        },
    ])('$testName', ({ inputUrl, expectedLabel = inputUrl, expectedUrl = inputUrl }) => {
        const extraFields: Pick<RstNodeObject, 'data'> = {}
        if (expectedLabel !== expectedUrl) {
            extraFields.data = {
                label: expectedLabel,
                target: expectedUrl,
            }
        }

        describe('parses as HyperlinkRef child in Paragraph', () => {
            const input = `
                ${inputUrl}
            `

            testParser(input, [
                {
                    type: RstNodeType.Paragraph,
                    children: [
                        {
                            type: RstNodeType.HyperlinkRef,
                            text: expectedLabel,
                            ...extraFields,
                        },
                    ],
                },
            ])

            testGenerator(input, `
                <p>
                    <a href="${expectedUrl}">${sanitizeHtml(expectedLabel)}</a>
                </p>
            `, `
                [${sanitizeHtml(expectedLabel)}](${expectedUrl})
            `)
        })

        describe('should parse embeded url in label', () => {
            const input = `
                \`test label <${inputUrl}>\`__
            `

            testParser(input, [
                {
                    type: RstNodeType.Paragraph,
                    children: [
                        {
                            type: RstNodeType.HyperlinkRef,
                            text: 'test label',
                            data: {
                                label: 'test label',
                                target: expectedUrl,
                                isAnonymous: true,
                                isEmbeded: true,
                            },
                        },
                    ],
                },
            ])

            testGenerator(input, `
                <p>
                    <a href="${expectedUrl}">test label</a>
                </p>
            `, `
                [test label](${expectedUrl})
            `)
        })

        describe('when url is in the middle of sentence, it parses as [Text, HyperlinkRef, Text]', () => {
            const input = `
                start ${inputUrl} end
            `

            testParser(input, [
                {
                    type: RstNodeType.Paragraph,
                    children: [
                        {
                            type: RstNodeType.Text,
                            text: 'start ',
                        },
                        {
                            type: RstNodeType.HyperlinkRef,
                            text: expectedLabel,
                            ...extraFields,
                        },
                        {
                            type: RstNodeType.Text,
                            text: ' end',
                        },
                    ],
                },
            ])

            testGenerator(input, `
                <p>
                    start <a href="${expectedUrl}">${sanitizeHtml(expectedLabel)}</a> end
                </p>
            `, `
                start [${sanitizeHtml(expectedLabel)}](${expectedUrl}) end
            `)
        })

        describe('when url is wrapped with angled brackets, the brackets should not be part of url', () => {
            const input = `
                <${inputUrl}>
            `

            testParser(input, [
                {
                    type: RstNodeType.Paragraph,
                    children: [
                        {
                            type: RstNodeType.HyperlinkRef,
                            text: expectedLabel,
                            ...extraFields,
                        },
                    ],
                },
            ])

            testGenerator(input, `
                <p>
                    <a href="${expectedUrl}">${sanitizeHtml(expectedLabel)}</a>
                </p>
            `, `
                [${sanitizeHtml(expectedLabel)}](${expectedUrl})
            `)
        })

        describe('when there are multiple standalone urls, they are all parsed as HyperlinkRefs', () => {
            const input = `
                ${inputUrl} ${inputUrl} ${inputUrl}
            `

            testParser(input, [
                {
                    type: RstNodeType.Paragraph,
                    children: [
                        {
                            type: RstNodeType.HyperlinkRef,
                            text: expectedLabel,
                            ...extraFields,
                        },
                        {
                            type: RstNodeType.Text,
                            text: ' ',
                        },
                        {
                            type: RstNodeType.HyperlinkRef,
                            text: expectedLabel,
                            ...extraFields,
                        },
                        {
                            type: RstNodeType.Text,
                            text: ' ',
                        },
                        {
                            type: RstNodeType.HyperlinkRef,
                            text: expectedLabel,
                            ...extraFields,
                        },
                    ],
                },
            ])

            testGenerator(input, `
                <p>
                    <a href="${expectedUrl}">${sanitizeHtml(expectedLabel)}</a> <a href="${expectedUrl}">${sanitizeHtml(expectedLabel)}</a> <a href="${expectedUrl}">${sanitizeHtml(expectedLabel)}</a>
                </p>
            `, `
                [${sanitizeHtml(expectedLabel)}](${expectedUrl}) [${sanitizeHtml(expectedLabel)}](${expectedUrl}) [${sanitizeHtml(expectedLabel)}](${expectedUrl})
            `)
        })
    })
})

// ----------------------------------------------------------------------------
// MARK: Standalone HyperlinkRef Alias
// ----------------------------------------------------------------------------

describe('Simple HyperlinkRef', () => {
    describe('named', () => {
        const input = `
            Hello Google_

            .. _Google: https://google.ca
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                children: [
                    {
                        type: RstNodeType.Text,
                        text: 'Hello ',
                    },
                    {
                        type: RstNodeType.HyperlinkRef,
                        text: 'Google',
                        data: {
                            isAlias: true,
                        },
                    },
                ],
            },
            {
                type: RstNodeType.HyperlinkTarget,
                data: {
                    label: 'Google',
                    target: 'https://google.ca',
                },
            },
        ])

        testGenerator(input, `
            <p>
                Hello <a href="https://google.ca">Google</a>
            </p>

            <!-- HyperlinkTarget id:4 children:0 label:"Google" target:"https://google.ca" resolvedUrl:"https://google.ca" -->
        `, `
            Hello [Google](https://google.ca)

            [HyperlinkTarget id:4 children:0 label:"Google" target:"https://google.ca" resolvedUrl:"https://google.ca"]: #
        `)
    })

    describe('anonymous', () => {
        const input = `
            Hello Google__

            .. __: https://google.ca
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                children: [
                    {
                        type: RstNodeType.Text,
                        text: 'Hello ',
                    },
                    {
                        type: RstNodeType.HyperlinkRef,
                        text: 'Google',
                        data: {
                            isAlias: true,
                            isAnonymous: true,
                        },
                    },
                ],
            },
            {
                type: RstNodeType.HyperlinkTarget,
                data: {
                    label: '_',
                    target: 'https://google.ca',
                    isAnonymous: true,
                },
            },
        ])

        testGenerator(input, `
            <p>
                Hello <a href="https://google.ca">Google</a>
            </p>

            <!-- HyperlinkTarget id:4 children:0 label:"_" target:"https://google.ca" isAnonymous:true resolvedUrl:"https://google.ca" -->
        `, `
            Hello [Google](https://google.ca)

            [HyperlinkTarget id:4 children:0 label:"_" target:"https://google.ca" isAnonymous:true resolvedUrl:"https://google.ca"]: #
        `)
    })
})
