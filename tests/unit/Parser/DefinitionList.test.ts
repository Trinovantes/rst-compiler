import { test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('no classifier', () => {
    const input = `
        term
            definition
    `

    expectDocument(input, [
        {
            type: RstNodeType.DefinitionList,
            children: [
                {
                    type: RstNodeType.DefinitionListItem,
                    meta: {
                        term: 'term',
                        classifiers: [],
                        definition: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'definition',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('1 classifier', () => {
    const input = `
        term : classifier 1
            definition
    `

    expectDocument(input, [
        {
            type: RstNodeType.DefinitionList,
            children: [
                {
                    type: RstNodeType.DefinitionListItem,
                    meta: {
                        term: 'term',
                        classifiers: [
                            'classifier 1',
                        ],
                        definition: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'definition',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('2 classifiers', () => {
    const input = `
        term : classifier 1 : classifier 2
            definition
    `

    expectDocument(input, [
        {
            type: RstNodeType.DefinitionList,
            children: [
                {
                    type: RstNodeType.DefinitionListItem,
                    meta: {
                        term: 'term',
                        classifiers: [
                            'classifier 1',
                            'classifier 2',
                        ],
                        definition: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'definition',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('when classifier is not formated with space+colon+space, it is parsed as part of term', () => {
    const input = `
        term: not a classifier
            definition
    `

    expectDocument(input, [
        {
            type: RstNodeType.DefinitionList,
            children: [
                {
                    type: RstNodeType.DefinitionListItem,
                    meta: {
                        term: 'term: not a classifier',
                        classifiers: [],
                        definition: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'definition',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('when term starts with escape character, it is parsed as definition list instead of option list', () => {
    const input = `
        \\-term 5
            Without escaping, this would be an option list item.
    `

    expectDocument(input, [
        {
            type: RstNodeType.DefinitionList,
            children: [
                {
                    type: RstNodeType.DefinitionListItem,
                    meta: {
                        term: '\\-term 5',
                        classifiers: [],
                        definition: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Without escaping, this would be an option list item.',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})
