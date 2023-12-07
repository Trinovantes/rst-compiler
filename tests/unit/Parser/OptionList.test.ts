import { test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'
import { parseTestInput } from '../../fixtures/parseTestInput.js'

test('short-form option list without arg', () => {
    const input = `
        -f  Desc
    `

    expectDocument(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    meta: {
                        options: [
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: undefined,
                            },
                        ],
                        desc: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Desc',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('short-form option list with arg', () => {
    const input = `
        -f FILE  Desc
    `

    expectDocument(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    meta: {
                        options: [
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: 'FILE',
                            },
                        ],
                        desc: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Desc',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('long-form option list without arg', () => {
    const input = `
        --f  Desc
    `

    expectDocument(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    meta: {
                        options: [
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: undefined,
                            },
                        ],
                        desc: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Desc',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('long-form option list with arg', () => {
    const input = `
        --f FILE  Desc
    `

    expectDocument(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    meta: {
                        options: [
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: 'FILE',
                            },
                        ],
                        desc: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Desc',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('option list with multi-line description', () => {
    const input = `
        -f FILE  Desc 1
                 Desc 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    meta: {
                        options: [
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: 'FILE',
                            },
                        ],
                        desc: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Desc 1\nDesc 2',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('option list with multi-line description but subsequent lines are on different indentation', () => {
    const input = `
        -f FILE  Desc 1
            Desc 2
            Desc 3
    `

    expectDocument(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    meta: {
                        options: [
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: 'FILE',
                            },
                        ],
                        desc: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Desc 1\nDesc 2\nDesc 3',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('option list with description on second line', () => {
    const input = `
        -f FILE
            Desc
    `

    expectDocument(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    meta: {
                        options: [
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: 'FILE',
                            },
                        ],
                        desc: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Desc',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

test('option list with multiple options', () => {
    const input = `
        -f FILE1, --file=FILE2, -f <any[]character here>
            Desc
    `

    expectDocument(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    meta: {
                        options: [
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: 'FILE1',
                            },
                            {
                                name: 'file',
                                delimiter: '=',
                                argName: 'FILE2',
                            },
                            {
                                name: 'f',
                                delimiter: ' ',
                                argName: '<any[]character here>',
                            },
                        ],
                        desc: [
                            {
                                type: RstNodeType.Paragraph,
                                text: 'Desc',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})
