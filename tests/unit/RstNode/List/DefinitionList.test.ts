import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when the second line after text is indented, it parses as DefinitionList', () => {
    const input = `
        term
            definition
    `

    testParser(input, [
        {
            type: 'DefinitionList',
            children: [
                {
                    type: 'DefinitionListItem',
                    data: {
                        term: [
                            {
                                type: 'Text',
                                text: 'term',
                            },
                        ],
                        classifiers: [],
                        definition: [
                            {
                                type: 'Paragraph',
                                text: 'definition',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl>
            <dt>
                term
            </dt>
            <dd>
                <p>
                    definition
                </p>
            </dd>
        </dl>
    `, `
        **term**

        definition
    `)
})

describe('when definition has text followed by colon, it parses as classifier for DefinitionListItem', () => {
    const input = `
        term : classifier 1
            definition
    `

    testParser(input, [
        {
            type: 'DefinitionList',
            children: [
                {
                    type: 'DefinitionListItem',
                    data: {
                        term: [
                            {
                                type: 'Text',
                                text: 'term',
                            },
                        ],
                        classifiers: [
                            [
                                {
                                    type: 'Text',
                                    text: 'classifier 1',
                                },
                            ],
                        ],
                        definition: [
                            {
                                type: 'Paragraph',
                                text: 'definition',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl>
            <dt>
                term <span class="classifier">classifier 1</span>
            </dt>
            <dd>
                <p>
                    definition
                </p>
            </dd>
        </dl>
    `, `
        **term *classifier 1***

        definition
    `)
})

describe('when there are multiple colons, it parses as multiple classifiers in same DefinitionListItem', () => {
    const input = `
        term : classifier 1 : classifier two
            definition
    `

    testParser(input, [
        {
            type: 'DefinitionList',
            children: [
                {
                    type: 'DefinitionListItem',
                    data: {
                        term: [
                            {
                                type: 'Text',
                                text: 'term',
                            },
                        ],
                        classifiers: [
                            [
                                {
                                    type: 'Text',
                                    text: 'classifier 1',
                                },
                            ],
                            [
                                {
                                    type: 'Text',
                                    text: 'classifier two',
                                },
                            ],
                        ],
                        definition: [
                            {
                                type: 'Paragraph',
                                text: 'definition',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl>
            <dt>
                term <span class="classifier">classifier 1</span> <span class="classifier">classifier two</span>
            </dt>
            <dd>
                <p>
                    definition
                </p>
            </dd>
        </dl>
    `, `
        **term *classifier 1* *classifier two***

        definition
    `)
})

describe('when classifier is not formated with space+colon+space, it parses as part of term (no classifier)', () => {
    const input = `
        term: not a classifier
            definition
    `

    testParser(input, [
        {
            type: 'DefinitionList',
            children: [
                {
                    type: 'DefinitionListItem',
                    data: {
                        term: [
                            {
                                type: 'Text',
                                text: 'term: not a classifier',
                            },
                        ],
                        classifiers: [],
                        definition: [
                            {
                                type: 'Paragraph',
                                text: 'definition',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl>
            <dt>
                term: not a classifier
            </dt>
            <dd>
                <p>
                    definition
                </p>
            </dd>
        </dl>
    `, `
        **term: not a classifier**

        definition
    `)
})

describe('when term has inline markup with space+colon+space inside, it is prioritized over classifier delimiter', () => {
    const input = `
        **term 4** : *classifier one* : :sup:\`test\` *start : end*
            Definition 4
    `

    testParser(input, [
        {
            type: 'DefinitionList',
            children: [
                {
                    type: 'DefinitionListItem',
                    data: {
                        term: [
                            {
                                type: 'StrongEmphasis',
                                text: 'term 4',
                            },
                        ],
                        classifiers: [
                            [
                                {
                                    type: 'Emphasis',
                                    text: 'classifier one',
                                },
                            ],
                            [
                                {
                                    type: 'InterpretedText',
                                    text: 'test',
                                    data: {
                                        role: 'sup',
                                    },
                                },
                                {
                                    type: 'Text',
                                    text: ' ',
                                },
                                {
                                    type: 'Emphasis',
                                    text: 'start : end',
                                },
                            ],
                        ],
                        definition: [
                            {
                                type: 'Paragraph',
                                text: 'Definition 4',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl>
            <dt>
                <strong>term 4</strong> <span class="classifier"><em>classifier one</em></span> <span class="classifier"><sup>test</sup> <em>start : end</em></span>
            </dt>
            <dd>
                <p>
                    Definition 4
                </p>
            </dd>
        </dl>
    `, `
        ****term 4** **classifier one** *^test^ *start : end****

        Definition 4
    `)
})
