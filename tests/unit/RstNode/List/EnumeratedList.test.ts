import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import type { RstEnumeratedListType } from '../../../../src/RstNode/List/EnumeratedListType.ts'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('EnumeratedList', () => {
    describe.each<{
        label: string
        listType: RstEnumeratedListType
        bullets: [string, string, string]
        mdBullets?: [string, string, string]
        htmlListAttr?: string
    }>([
        {
            label: 'arabic numerals',
            listType: 'Arabic',
            bullets: ['1', '2', '3'],
        },
        {
            label: 'lowercase alphabet characters',
            listType: 'AlphabetLower',
            bullets: ['a', 'b', 'c'],
            mdBullets: ['1', '2', '3'],
            htmlListAttr: ' type="a"',
        },
        {
            label: 'uppercase alphabet characters',
            listType: 'AlphabetUpper',
            bullets: ['A', 'B', 'C'],
            mdBullets: ['1', '2', '3'],
            htmlListAttr: ' type="A"',
        },
        {
            label: 'lowercase roman numerals',
            listType: 'RomanLower',
            bullets: ['i', 'ii', 'iii'],
            mdBullets: ['1', '2', '3'],
            htmlListAttr: ' type="i"',
        },
        {
            label: 'uppercase roman numerals',
            listType: 'RomanUpper',
            bullets: ['I', 'II', 'III'],
            mdBullets: ['1', '2', '3'],
            htmlListAttr: ' type="I"',
        },
        {
            label: 'auto enumerator',
            listType: 'Arabic',
            bullets: ['#', '#', '#'],
            mdBullets: ['1', '2', '3'],
        },
    ])('$label', ({ bullets, mdBullets = bullets, listType, htmlListAttr }) => {
        describe('when items are separated by linebreaks, it parses as BulletListItems', () => {
            const input = `
                ${bullets[0]}. item 1

                ${bullets[1]}. item 2

                ${bullets[2]}. item 3
            `

            testParser(input, [
                {
                    type: 'EnumeratedList',
                    data: {
                        listType,
                    },
                    children: [
                        {
                            type: 'BulletListItem',
                            text: 'item 1',
                            data: {
                                bullet: bullets[0],
                            },
                        },
                        {
                            type: 'BulletListItem',
                            text: 'item 2',
                            data: {
                                bullet: bullets[1],
                            },
                        },
                        {
                            type: 'BulletListItem',
                            text: 'item 3',
                            data: {
                                bullet: bullets[2],
                            },
                        },
                    ],
                },
            ])

            testGenerator(input, `
                <ol${htmlListAttr ?? ''}>
                    <li>
                        <p>
                            item 1
                        </p>
                    </li>

                    <li>
                        <p>
                            item 2
                        </p>
                    </li>

                    <li>
                        <p>
                            item 3
                        </p>
                    </li>
                </ol>
            `, `
                ${mdBullets[0]}. item 1

                ${mdBullets[1]}. item 2

                ${mdBullets[2]}. item 3
            `)
        })

        describe('when items are not separated by linebreaks, it parses as BulletListItems', () => {
            const input = `
                ${bullets[0]}. item 1
                ${bullets[1]}. item 2
                ${bullets[2]}. item 3
            `

            testParser(input, [
                {
                    type: 'EnumeratedList',
                    data: {
                        listType,
                    },
                    children: [
                        {
                            type: 'BulletListItem',
                            text: 'item 1',
                            data: {
                                bullet: bullets[0],
                            },
                        },
                        {
                            type: 'BulletListItem',
                            text: 'item 2',
                            data: {
                                bullet: bullets[1],
                            },
                        },
                        {
                            type: 'BulletListItem',
                            text: 'item 3',
                            data: {
                                bullet: bullets[2],
                            },
                        },
                    ],
                },
            ])

            testGenerator(input, `
                <ol${htmlListAttr ?? ''}>
                    <li>
                        <p>
                            item 1
                        </p>
                    </li>

                    <li>
                        <p>
                            item 2
                        </p>
                    </li>

                    <li>
                        <p>
                            item 3
                        </p>
                    </li>
                </ol>
            `, `
                ${mdBullets[0]}. item 1

                ${mdBullets[1]}. item 2

                ${mdBullets[2]}. item 3
            `)
        })

        if (bullets[0] !== '#') {
            describe('when enumerator is delimited by list character, it parses as EnumeratedList', () => {
                describe('suffixed with a period', () => {
                    const input = `
                        ${bullets[0]}. item 1
                    `

                    testParser(input, [
                        {
                            type: 'EnumeratedList',
                            data: {
                                listType,
                            },
                            children: [
                                {
                                    type: 'BulletListItem',
                                    text: 'item 1',
                                    data: {
                                        bullet: bullets[0],
                                    },
                                },
                            ],
                        },
                    ])
                })

                describe('suffixed with a right-paranthesis', () => {
                    const input = `
                        ${bullets[0]}) item 1
                    `

                    testParser(input, [
                        {
                            type: 'EnumeratedList',
                            data: {
                                listType,
                            },
                            children: [
                                {
                                    type: 'BulletListItem',
                                    text: 'item 1',
                                    data: {
                                        bullet: bullets[0],
                                    },
                                },
                            ],
                        },
                    ])
                })

                describe('surrounded by paranthesis', () => {
                    const input = `
                        (${bullets[0]}) item 1
                    `

                    testParser(input, [
                        {
                            type: 'EnumeratedList',
                            data: {
                                listType,
                            },
                            children: [
                                {
                                    type: 'BulletListItem',
                                    text: 'item 1',
                                    data: {
                                        bullet: bullets[0],
                                    },
                                },
                            ],
                        },
                    ])
                })

                describe('when there is an opening paranthesis but no closing paranthesis, it does not parse as EnumeratedList', () => {
                    const input = `
                        (${bullets[0]} item 1
                    `

                    testParser(input, [
                        {
                            type: 'Paragraph',
                            text: `(${bullets[0]} item 1`,
                        },
                    ])
                })
            })

            describe('when enumerators start with non-default starting value, it generates the starting value', () => {
                const input = `
                    ${bullets[1]}. item 2

                    ${bullets[2]}. item 3
                `

                testGenerator(input, `
                    <ol${htmlListAttr ?? ''}>
                        <li value="${mdBullets[1]}">
                            <p>
                                item 2
                            </p>
                        </li>

                        <li>
                            <p>
                                item 3
                            </p>
                        </li>
                    </ol>
                `, `
                    ${mdBullets[1]}. item 2

                    ${mdBullets[2]}. item 3
                `)
            })

            describe('when enumerators are not in sequence, it parses as multiple EnumeratedLists', () => {
                const input = `
                    ${bullets[0]}. item 1

                    ${bullets[2]}. item 3
                `

                testParser(input, [
                    {
                        type: 'EnumeratedList',
                        data: {
                            listType,
                        },
                        children: [
                            {
                                type: 'BulletListItem',
                                text: 'item 1',
                                data: {
                                    bullet: bullets[0],
                                },
                            },
                        ],
                    },
                    {
                        type: 'EnumeratedList',
                        data: {
                            listType,
                        },
                        children: [
                            {
                                type: 'BulletListItem',
                                text: 'item 3',
                                data: {
                                    bullet: bullets[2],
                                },
                            },
                        ],
                    },
                ])

                testGenerator(input, `
                    <ol${htmlListAttr ?? ''}>
                        <li>
                            <p>
                                item 1
                            </p>
                        </li>
                    </ol>
            
                    <ol${htmlListAttr ?? ''}>
                        <li value="${mdBullets[2]}">
                            <p>
                                item 3
                            </p>
                        </li>
                    </ol>
                `, `
                    ${mdBullets[0]}. item 1
            
                    ${mdBullets[2]}. item 3
                `)
            })
        }
    })
})

describe('when second line is not indented, it parses as Paragraph instead', () => {
    const input = `
        A. Einstein was a really
        smart dude.
    `

    testParser(input, [
        {
            type: 'Paragraph',
            text: 'A. Einstein was a really\nsmart dude.',
        },
    ])
})

describe('when enumerators do not have the same sequence, it parses as multiple EnumeratedLists', () => {
    const input = `
        1. list 1

        a. list 2
    `

    testParser(input, [
        {
            type: 'EnumeratedList',
            data: {
                listType: 'Arabic',
            },
            children: [
                {
                    type: 'BulletListItem',
                    text: 'list 1',
                    data: {
                        bullet: '1',
                    },
                },
            ],
        },
        {
            type: 'EnumeratedList',
            data: {
                listType: 'AlphabetLower',
            },
            children: [
                {
                    type: 'BulletListItem',
                    text: 'list 2',
                    data: {
                        bullet: 'a',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <ol>
            <li>
                <p>
                    list 1
                </p>
            </li>
        </ol>

        <ol type="a">
            <li>
                <p>
                    list 2
                </p>
            </li>
        </ol>
    `, `
        1. list 1

        1. list 2
    `)
})
