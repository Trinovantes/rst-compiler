import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe.each<{
    role: string
    htmlTag: string
    mdStr: string
    htmlClass?: string
}>([
    {
        role: 'sub',
        htmlTag: 'sub',
        mdStr: '~',
    },
    {
        role: 'sup',
        htmlTag: 'sup',
        mdStr: '^',
    },
    {
        role: 'ac',
        htmlTag: 'abbr',
        mdStr: '*',
    },
    {
        role: 'acronym',
        htmlTag: 'abbr',
        mdStr: '*',
    },
    {
        role: 'emphasis',
        htmlTag: 'em',
        mdStr: '*',
    },
    {
        role: 'strong',
        htmlTag: 'strong',
        mdStr: '**',
    },
    {
        role: 'code',
        htmlTag: 'code',
        mdStr: '`',
    },
    {
        role: 'literal',
        htmlTag: 'span',
        mdStr: '`',
        htmlClass: 'literal',
    },
    {
        role: 'title',
        htmlTag: 'cite',
        mdStr: '*',
    },
    {
        role: 'kbd',
        htmlTag: 'kbd',
        mdStr: '`',
    },
])('when InterpretedText has :$role: role, it generates as $htmlTag', ({ role, htmlTag, mdStr, htmlClass }) => {
    const input = `
        :${role}:\`test\`
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.InterpretedText,
                    text: 'test',
                    data: {
                        role,
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            <${htmlTag}${htmlClass ? ` class="${htmlClass}"` : ''}>test</${htmlTag}>
        </p>
    `, `
        ${mdStr}test${mdStr}
    `)
})
