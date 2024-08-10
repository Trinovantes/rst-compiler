import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe.each([
    'info',
    'tip',
    'warning',
    'danger',
])('%s', (directive) => {
    const input = `
        .. ${directive}:: Godot's documentation is available in various languages and versions.
            Expand the "Read the Docs" panel at the bottom of the sidebar to see
            the list.
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive,
            },
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'Godot\'s documentation is available in various languages and versions.\nExpand the "Read the Docs" panel at the bottom of the sidebar to see\nthe list.',
                },
            ],
        },
    ])

    testGenerator(input, `
        <div class="admonition ${directive}">
            <p>
                Godot&apos;s documentation is available in various languages and versions.
                Expand the &quot;Read the Docs&quot; panel at the bottom of the sidebar to see
                the list.
            </p>
        </div>
    `, `
        ::: ${directive}
        Godot&apos;s documentation is available in various languages and versions.
        Expand the &quot;Read the Docs&quot; panel at the bottom of the sidebar to see
        the list.
        :::
    `)
})

describe('nested admonitions', () => {
    const input = `
        .. info:: Outer 1

            .. warning:: Inner 1

                .. error:: Hello World

            .. warning:: Inner 2

        .. info:: Outer 2
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'info',
            },
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'Outer 1',
                },
                {
                    type: RstNodeType.Directive,
                    data: {
                        directive: 'warning',
                    },
                    children: [
                        {
                            type: RstNodeType.Paragraph,
                            text: 'Inner 1',
                        },
                        {
                            type: RstNodeType.Directive,
                            data: {
                                directive: 'error',
                            },
                            children: [
                                {
                                    type: RstNodeType.Paragraph,
                                    text: 'Hello World',
                                },
                            ],
                        },
                    ],
                },
                {
                    type: RstNodeType.Directive,
                    data: {
                        directive: 'warning',
                    },
                    children: [
                        {
                            type: RstNodeType.Paragraph,
                            text: 'Inner 2',
                        },
                    ],
                },
            ],
        },
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'info',
            },
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'Outer 2',
                },
            ],
        },
    ])

    testGenerator(input, `
        <div class="admonition info">
            <p>
                Outer 1
            </p>

            <div class="admonition warning">
                <p>
                    Inner 1
                </p>

                <div class="admonition error">
                    <p>
                        Hello World
                    </p>
                </div>
            </div>

            <div class="admonition warning">
                <p>
                    Inner 2
                </p>
            </div>
        </div>

        <div class="admonition info">
            <p>
                Outer 2
            </p>
        </div>
    `, `
        ::::::::: info
        Outer 1

        :::::: warning
        Inner 1

        ::: danger
        Hello World
        :::
        ::::::

        ::: warning
        Inner 2
        :::
        :::::::::

        ::: info
        Outer 2
        :::
    `)
})
