import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('simple table', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
            meta: {
                headRows: [],
                bodyRows: [
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 1',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 2',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('simple table must have at least 2 columns, otherwise it will be parsed as section', () => {
    const input = `
        =====
        col 1
        =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Section,
            text: 'col 1',
            meta: {
                level: 1,
            },
        },
    ])
})

test('simple table with header separator', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
        test1  test2
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
            meta: {
                headRows: [
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 1',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 2',
                            },
                        ],
                    },
                ],
                bodyRows: [
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'test1',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'test2',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('when there is a line break after header separator, it breaks stops the table parsing after the header', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====

        test1  test2
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
            meta: {
                headRows: [],
                bodyRows: [
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 1',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 2',
                            },
                        ],
                    },
                ],
            },
        },
        {
            type: RstNodeType.Paragraph,
            text: 'test1  test2\n=====  =====',
        },
    ])
})

test('simple table with empty cell not in first column', () => {
    const input = `
        =====  =====
        col 1  col 2
        test
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
            meta: {
                headRows: [],
                bodyRows: [
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 1',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 2',
                            },
                        ],
                    },
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'test',
                            },
                            {
                                type: RstNodeType.TableCell,
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('when there is an empty cell in first column, it should not be a new row', () => {
    const input = `
        =====  =====
        col 1  col 2
               test
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
            meta: {
                headRows: [],
                bodyRows: [
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 1',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 2\ntest',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('when there is an empty cell in first column in first row after header separator, it should be a new row', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
               test1
        test2  test3
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
            meta: {
                headRows: [
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 1',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'col 2',
                            },
                        ],
                    },
                ],
                bodyRows: [
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'test1',
                            },
                        ],
                    },
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'test2',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'test3',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})
