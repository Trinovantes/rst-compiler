import { RstNodeType } from '@/RstNode/RstNodeType.js'
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
            type: RstNodeType.Directive,
            data: {
                directive: 'video',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'video.webm',
                    },
                ],
                config: {
                    type: RstNodeType.FieldList,
                    children: [
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'alt',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: 'Put a text description of the video here',
                                    },
                                ],
                            },
                        },
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'class',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: 'hello-world',
                                    },
                                ],
                            },
                        },
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'preload',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: 'auto',
                                    },
                                ],
                            },
                        },
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'muted',
                                    },
                                ],
                                body: [],
                            },
                        },
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'nocontrols',
                                    },
                                ],
                                body: [],
                            },
                        },
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'autoplay',
                                    },
                                ],
                                body: [],
                            },
                        },
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
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
