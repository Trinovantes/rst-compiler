import { describe, test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'
import { EnumeratedListType } from '@/Parser/List/EnumeratedListType.js'

describe('enumerations denote start of enumerated list', () => {
    test('arabic numerals', () => {
        const input = `
            1. arabic numerals 1

            2. arabic numerals 2

            3. arabic numerals 3
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.Arabic,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'arabic numerals 1',
                        meta: {
                            bullet: '1',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'arabic numerals 2',
                        meta: {
                            bullet: '2',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'arabic numerals 3',
                        meta: {
                            bullet: '3',
                        },
                    },
                ],
            },
        ])
    })

    test('lowercase alphabet characters', () => {
        const input = `
            a. lowercase alphabet 1

            b. lowercase alphabet 2

            c. lowercase alphabet 3
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.AlphabetLower,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'lowercase alphabet 1',
                        meta: {
                            bullet: 'a',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'lowercase alphabet 2',
                        meta: {
                            bullet: 'b',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'lowercase alphabet 3',
                        meta: {
                            bullet: 'c',
                        },
                    },
                ],
            },
        ])
    })

    test('uppercase alphabet characters', () => {
        const input = `
            A. uppercase alphabet 1

            B. uppercase alphabet 2

            C. uppercase alphabet 3
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.AlphabetUpper,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'uppercase alphabet 1',
                        meta: {
                            bullet: 'A',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'uppercase alphabet 2',
                        meta: {
                            bullet: 'B',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'uppercase alphabet 3',
                        meta: {
                            bullet: 'C',
                        },
                    },
                ],
            },
        ])
    })

    test('lowercase roman numerals', () => {
        const input = `
            i. lowercase roman numerals 1

            ii. lowercase roman numerals 2

            iii. lowercase roman numerals 3
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.RomanLower,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'lowercase roman numerals 1',
                        meta: {
                            bullet: 'i',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'lowercase roman numerals 2',
                        meta: {
                            bullet: 'ii',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'lowercase roman numerals 3',
                        meta: {
                            bullet: 'iii',
                        },
                    },
                ],
            },
        ])
    })

    test('uppercase roman numerals', () => {
        const input = `
            I. uppercase roman numerals 1

            II. uppercase roman numerals 2

            III. uppercase roman numerals 3
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.RomanUpper,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'uppercase roman numerals 1',
                        meta: {
                            bullet: 'I',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'uppercase roman numerals 2',
                        meta: {
                            bullet: 'II',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'uppercase roman numerals 3',
                        meta: {
                            bullet: 'III',
                        },
                    },
                ],
            },
        ])
    })

    test('auto-enumerator', () => {
        const input = `
            #. auto 1

            #. auto 2

            #. auto 3
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.Arabic,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'auto 1',
                        meta: {
                            bullet: '#',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'auto 2',
                        meta: {
                            bullet: '#',
                        },
                    },
                    {
                        type: RstNodeType.ListItem,
                        text: 'auto 3',
                        meta: {
                            bullet: '#',
                        },
                    },
                ],
            },
        ])
    })
})

describe('formatting', () => {
    test('suffixed with a period', () => {
        const input = `
            1. list 1
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.Arabic,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 1',
                        meta: {
                            bullet: '1',
                        },
                    },
                ],
            },
        ])
    })

    test('suffixed with a right-paranthesis', () => {
        const input = `
            1) list 1
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.Arabic,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 1',
                        meta: {
                            bullet: '1',
                        },
                    },
                ],
            },
        ])
    })

    test('surrounded by paranthesis', () => {
        const input = `
            (1) list 1
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.Arabic,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 1',
                        meta: {
                            bullet: '1',
                        },
                    },
                ],
            },
        ])
    })

    test('when there is an opening paranthesis but no closing paranthesis, it does not parse as list', () => {
        const input = `
            (1 list 1
        `

        expectDocument(input, [
            {
                type: RstNodeType.Paragraph,
                text: '(1 list 1',
            },
        ])
    })
})

test('when second line is not indented, it is parsed as paragraph instead', () => {
    const input = `
        A. Einstein was a really
        smart dude.
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'A. Einstein was a really\nsmart dude.',
        },
    ])
})

test('when enumerators do not have the same sequence, it starts a new list', () => {
    const input = `
        1. list 1

        a. list 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.EnumeratedList,
            meta: {
                listType: EnumeratedListType.Arabic,
            },
            children: [
                {
                    type: RstNodeType.ListItem,
                    text: 'list 1',
                    meta: {
                        bullet: '1',
                    },
                },
            ],
        },
        {
            type: RstNodeType.EnumeratedList,
            meta: {
                listType: EnumeratedListType.AlphabetLower,
            },
            children: [
                {
                    type: RstNodeType.ListItem,
                    text: 'list 2',
                    meta: {
                        bullet: 'a',
                    },
                },
            ],
        },
    ])
})

describe('when enumerators are not in sequence, it starts a new list', () => {
    test('for arabic', () => {
        const input = `
            1. list 1

            3. list 2
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.Arabic,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 1',
                        meta: {
                            bullet: '1',
                        },
                    },
                ],
            },
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.Arabic,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 2',
                        meta: {
                            bullet: '3',
                        },
                    },
                ],
            },
        ])
    })

    test('for alphabet', () => {
        const input = `
            a. list 1

            c. list 2
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.AlphabetLower,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 1',
                        meta: {
                            bullet: 'a',
                        },
                    },
                ],
            },
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.AlphabetLower,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 2',
                        meta: {
                            bullet: 'c',
                        },
                    },
                ],
            },
        ])
    })

    test('for roman', () => {
        const input = `
            i. list 1

            iii. list 2
        `

        expectDocument(input, [
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.RomanLower,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 1',
                        meta: {
                            bullet: 'i',
                        },
                    },
                ],
            },
            {
                type: RstNodeType.EnumeratedList,
                meta: {
                    listType: EnumeratedListType.RomanLower,
                },
                children: [
                    {
                        type: RstNodeType.ListItem,
                        text: 'list 2',
                        meta: {
                            bullet: 'iii',
                        },
                    },
                ],
            },
        ])
    })
})
