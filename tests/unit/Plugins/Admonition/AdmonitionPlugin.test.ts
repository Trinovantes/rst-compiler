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
