import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('single cell grid table', () => {
    const input = `
        +---+
        | A |
        +---+
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
                                text: 'A',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('multiple cell grid table', () => {
    const input = `
        +-+-+
        |A|B|
        +-+-+
        |C|D|
        +-+-+
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
                                text: 'A',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'B',
                            },
                        ],
                    },
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'C',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'D',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('grid table with header separator', () => {
    const input = `
        +-+-+
        |A|B|
        +=+=+
        |C|D|
        +-+-+
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
                                text: 'A',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'B',
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
                                text: 'C',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'D',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('column span', () => {
    const input = `
        +-+-+
        |A|C|
        +-+ |
        |B| |
        +-+-+
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
                                text: 'A',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'C',
                                meta: {
                                    colSpan: 1,
                                    rowSpan: 2,
                                },
                            },
                        ],
                    },
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'B',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('row span', () => {
    const input = `
        +-+-+
        |A  |
        +-+-+
        |B|C|
        +-+-+
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
                                text: 'A',
                                meta: {
                                    colSpan: 2,
                                    rowSpan: 1,
                                },
                            },
                        ],
                    },
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'B',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'C',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})

test('complex grid table', () => {
    const input = `
        +------------------------+------------+----------+----------+
        | Header row, column 1   | Header 2   | Header 3 | Header 4 |
        | (header rows optional) |            |          |          |
        +========================+============+==========+==========+
        | body row 1, column 1   | column 2   | column 3 | column 4 |
        +------------------------+------------+----------+----------+
        | body row 2             | Cells may span columns.          |
        +------------------------+------------+---------------------+
        | body row 3             | Cells may  | - Table cells       |
        +------------------------+ span rows. | - contain           |
        | body row 4             |            | - body elements.    |
        +------------------------+------------+---------------------+
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
                                text: 'Header row, column 1\n(header rows optional)',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'Header 2',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'Header 3',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'Header 4',
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
                                text: 'body row 1, column 1',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'column 2',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'column 3',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'column 4',
                            },
                        ],
                    },
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'body row 2',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'Cells may span columns.',
                                meta: {
                                    colSpan: 3,
                                    rowSpan: 1,
                                },
                            },
                        ],
                    },
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'body row 3',
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: 'Cells may\nspan rows.',
                                meta: {
                                    colSpan: 1,
                                    rowSpan: 2,
                                },
                            },
                            {
                                type: RstNodeType.TableCell,
                                text: '- Table cells\n- contain\n- body elements.',
                                meta: {
                                    colSpan: 2,
                                    rowSpan: 2,
                                },
                            },
                        ],
                    },
                    {
                        type: RstNodeType.TableRow,
                        children: [
                            {
                                type: RstNodeType.TableCell,
                                text: 'body row 4',
                            },
                        ],
                    },
                ],
            },
        },
    ])
})
