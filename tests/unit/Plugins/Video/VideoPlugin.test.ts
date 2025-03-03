import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe('video directive configs', () => {
    const input = `
        .. video:: video.webm
            :alt: Put a text description of the video here
            :class: hello-world
            :preload: auto
            :muted:
            :nocontrols:
            :autoplay:
            :loop:
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'video',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'video.webm',
                    },
                ],
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'alt',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'Put a text description of the video here',
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
                                        text: 'class',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'hello-world',
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
                                        text: 'preload',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'auto',
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
                                        text: 'muted',
                                    },
                                ],
                                body: [],
                            },
                        },
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'nocontrols',
                                    },
                                ],
                                body: [],
                            },
                        },
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'autoplay',
                                    },
                                ],
                                body: [],
                            },
                        },
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'loop',
                                    },
                                ],
                                body: [],
                            },
                        },
                    ],
                },
            },
        },
    ])

    testGenerator(input, `
        <video autoplay="true" class="hello-world" loop="true" muted="true" preload="auto">
            <source src="video.webm" type="video/webm" />
            <p>
                Put a text description of the video here
            </p>
        </video>
    `)
})
