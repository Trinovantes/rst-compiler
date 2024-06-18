import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('single cell', () => {
    const input = `
        +---+
        | A |
        +---+
    `

    testParser(input, [
        {
            type: RstNodeType.Table,
            children: [
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
    ])

    testGenerator(input, `
        <table>
            <tbody>
                <tr>
                    <td>
                        <p>
                            A
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe('multiple cells', () => {
    const input = `
        +-+-+
        |A|B|
        +-+-+
        |C|D|
        +-+-+
    `

    testParser(input, [
        {
            type: RstNodeType.Table,
            children: [
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
    ])

    testGenerator(input, `
        <table>
            <tbody>
                <tr>
                    <td>
                        <p>
                            A
                        </p>
                    </td>
                    <td>
                        <p>
                            B
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            C
                        </p>
                    </td>
                    <td>
                        <p>
                            D
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe('multiple cells with header separator', () => {
    const input = `
        +-+-+
        |A|B|
        +=+=+
        |C|D|
        +-+-+
    `

    testParser(input, [
        {
            type: RstNodeType.Table,
            children: [
                {
                    type: RstNodeType.TableRow,
                    data: {
                        isHeadRow: true,
                    },
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
    ])

    testGenerator(input, `
        <table>
            <thead>
                <tr>
                    <th>
                        <p>
                            A
                        </p>
                    </th>
                    <th>
                        <p>
                            B
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>
                            C
                        </p>
                    </td>
                    <td>
                        <p>
                            D
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `, `
        | A | B |
        | --- | --- |
        | C | D |
    `)
})

describe('row span', () => {
    const input = `
        +-+-+
        |A|C|
        +-+ |
        |B| |
        +-+-+
    `

    testParser(input, [
        {
            type: RstNodeType.Table,
            children: [
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
                            data: {
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
    ])

    testGenerator(input, `
        <table>
            <tbody>
                <tr>
                    <td>
                        <p>
                            A
                        </p>
                    </td>
                    <td rowspan="2">
                        <p>
                            C
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            B
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe('col span', () => {
    const input = `
        +-+-+
        |A  |
        +-+-+
        |B|C|
        +-+-+
    `

    testParser(input, [
        {
            type: RstNodeType.Table,
            children: [
                {
                    type: RstNodeType.TableRow,
                    children: [
                        {
                            type: RstNodeType.TableCell,
                            text: 'A',
                            data: {
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
    ])

    testGenerator(input, `
        <table>
            <tbody>
                <tr>
                    <td colspan="2">
                        <p>
                            A
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            B
                        </p>
                    </td>
                    <td>
                        <p>
                            C
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe('complex grid table', () => {
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

    testParser(input, [
        {
            type: RstNodeType.Table,
            children: [
                {
                    type: RstNodeType.TableRow,
                    data: {
                        isHeadRow: true,
                    },
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
                            data: {
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
                            data: {
                                colSpan: 1,
                                rowSpan: 2,
                            },
                        },
                        {
                            type: RstNodeType.TableCell,
                            data: {
                                colSpan: 2,
                                rowSpan: 2,
                            },
                            children: [
                                {
                                    type: RstNodeType.BulletList,
                                    children: [
                                        {
                                            type: RstNodeType.BulletListItem,
                                            text: 'Table cells',
                                            data: {
                                                bullet: '-',
                                            },
                                        },
                                        {
                                            type: RstNodeType.BulletListItem,
                                            text: 'contain',
                                            data: {
                                                bullet: '-',
                                            },
                                        },
                                        {
                                            type: RstNodeType.BulletListItem,
                                            text: 'body elements.',
                                            data: {
                                                bullet: '-',
                                            },
                                        },
                                    ],
                                },
                            ],
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
    ])

    testGenerator(input, `
        <table>
            <thead>
                <tr>
                    <th>
                        <p>
                            Header row, column 1
                            (header rows optional)
                        </p>
                    </th>
                    <th>
                        <p>
                            Header 2
                        </p>
                    </th>
                    <th>
                        <p>
                            Header 3
                        </p>
                    </th>
                    <th>
                        <p>
                            Header 4
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>
                            body row 1, column 1
                        </p>
                    </td>
                    <td>
                        <p>
                            column 2
                        </p>
                    </td>
                    <td>
                        <p>
                            column 3
                        </p>
                    </td>
                    <td>
                        <p>
                            column 4
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            body row 2
                        </p>
                    </td>
                    <td colspan="3">
                        <p>
                            Cells may span columns.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            body row 3
                        </p>
                    </td>
                    <td rowspan="2">
                        <p>
                            Cells may
                            span rows.
                        </p>
                    </td>
                    <td colspan="2" rowspan="2">
                        <ul>
                            <li>
                                <p>
                                    Table cells
                                </p>
                            </li>
                            <li>
                                <p>
                                    contain
                                </p>
                            </li>
                            <li>
                                <p>
                                    body elements.
                                </p>
                            </li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            body row 4
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})
