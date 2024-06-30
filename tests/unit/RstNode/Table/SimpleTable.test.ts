import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when there is no header separator, it only generates html', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
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
    ])

    testGenerator(input, `
        <table>
            <tbody>
                <tr>
                    <td>
                        <p>
                            col 1
                        </p>
                    </td>
                    <td>
                        <p>
                            col 2
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe('when there is header separator, it generates html and markdown', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
        test1  test2
        =====  =====
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
    ])

    testGenerator(input, `
        <table>
            <thead>
                <tr>
                    <th>
                        <p>
                            col 1
                        </p>
                    </th>
                    <th>
                        <p>
                            col 2
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>
                            test1
                        </p>
                    </td>
                    <td>
                        <p>
                            test2
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `, `
        | col 1 | col 2 |
        | --- | --- |
        | test1 | test2 |
    `)
})

describe('when SimpleTable have less than 2 columns, it parses as Section instead', () => {
    const input = `
        =====
        col 1
        =====
    `

    testParser(input, [
        {
            type: RstNodeType.Section,
            text: 'col 1',
            data: {
                level: 1,
            },
        },
    ])

    testGenerator(input, `
        <h1 id="col-1">
            col 1
        </h1>
    `, `
        # col 1 {#col-1}
    `)
})

describe('when there is linebreak after header separator, it parses as Table with only 1 row followed by unrelated Paragraph', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====

        test1  test2
        =====  =====
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
        {
            type: RstNodeType.Paragraph,
            text: 'test1  test2\n=====  =====',
        },
    ])

    testGenerator(input, `
        <table>
            <tbody>
                <tr>
                    <td>
                        <p>
                            col 1
                        </p>
                    </td>
                    <td>
                        <p>
                            col 2
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>

        <p>
            test1  test2
            =====  =====
        </p>
    `, `
        <table>
            <tbody>
                <tr>
                    <td>
                        <p>
                            col 1
                        </p>
                    </td>
                    <td>
                        <p>
                            col 2
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>

        test1  test2
        =====  =====
    `)
})

describe('when there is empty cell in second row in first column, it parses as same TableRow', () => {
    const input = `
        =====  =====
        col 1  col 2
               test
        =====  =====
        test1  test2
        =====  =====
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
                            text: 'col 1',
                        },
                        {
                            type: RstNodeType.TableCell,
                            text: 'col 2\ntest',
                        },
                    ],
                },
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
    ])

    testGenerator(input, `
        <table>
            <thead>
                <tr>
                    <th>
                        <p>
                            col 1
                        </p>
                    </th>
                    <th>
                        <p>
                            col 2
                            test
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>
                            test1
                        </p>
                    </td>
                    <td>
                        <p>
                            test2
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `, `
        | col 1 | col 2 test |
        | --- | --- |
        | test1 | test2 |
    `)
})

describe('when there is empty cell in second row not in first column, it parses as empty TableCell', () => {
    const input = `
        =====  =====
        col 1  col 2
        test
        =====  =====
        test1  test2
        =====  =====
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
                    data: {
                        isHeadRow: true,
                    },
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
    ])

    testGenerator(input, `
        <table>
            <thead>
                <tr>
                    <th>
                        <p>
                            col 1
                        </p>
                    </th>
                    <th>
                        <p>
                            col 2
                        </p>
                    </th>
                </tr>
                <tr>
                    <th>
                        <p>
                            test
                        </p>
                    </th>
                    <th>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>
                            test1
                        </p>
                    </td>
                    <td>
                        <p>
                            test2
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})

describe('when there is empty cell in first column in first row after header separator, it parse as new TableRow', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
               test1
        test2  test3
        =====  =====
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
    ])

    testGenerator(input, `
        <table>
            <thead>
                <tr>
                    <th>
                        <p>
                            col 1
                        </p>
                    </th>
                    <th>
                        <p>
                            col 2
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                    </td>
                    <td>
                        <p>
                            test1
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            test2
                        </p>
                    </td>
                    <td>
                        <p>
                            test3
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `, `
        | col 1 | col 2 |
        | --- | --- |
        |  | test1 |
        | test2 | test3 |
    `)
})

describe('rightmost column has unbounded size', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
        1      Second column of row 1.
        2      Second column of row 2.
               Second line of paragraph.
        3      - Second column of row 3.

               - Second item in bullet
                 list (row 3, column 2).
        \\      Row 4; column 1 will be empty.
        =====  =====
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
                            text: '1',
                        },
                        {
                            type: RstNodeType.TableCell,
                            text: 'Second column of row 1.',
                        },
                    ],
                },
                {
                    type: RstNodeType.TableRow,
                    children: [
                        {
                            type: RstNodeType.TableCell,
                            text: '2',
                        },
                        {
                            type: RstNodeType.TableCell,
                            text: 'Second column of row 2.\nSecond line of paragraph.',
                        },
                    ],
                },
                {
                    type: RstNodeType.TableRow,
                    children: [
                        {
                            type: RstNodeType.TableCell,
                            text: '3',
                        },
                        {
                            type: RstNodeType.TableCell,
                            children: [
                                {
                                    type: RstNodeType.BulletList,
                                    children: [
                                        {
                                            type: RstNodeType.BulletListItem,
                                            text: 'Second column of row 3.',
                                            data: {
                                                bullet: '-',
                                            },
                                        },
                                        {
                                            type: RstNodeType.BulletListItem,
                                            text: 'Second item in bullet\nlist (row 3, column 2).',
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
                            text: '\\',
                        },
                        {
                            type: RstNodeType.TableCell,
                            text: 'Row 4; column 1 will be empty.',
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
                            col 1
                        </p>
                    </th>
                    <th>
                        <p>
                            col 2
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p>
                            1
                        </p>
                    </td>
                    <td>
                        <p>
                            Second column of row 1.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            2
                        </p>
                    </td>
                    <td>
                        <p>
                            Second column of row 2.
                            Second line of paragraph.
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            3
                        </p>
                    </td>
                    <td>
                        <ul>
                            <li>
                                <p>
                                    Second column of row 3.
                                </p>
                            </li>
                            <li>
                                <p>
                                    Second item in bullet
                                    list (row 3, column 2).
                                </p>
                            </li>
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td>
                        <p>
                            \\
                        </p>
                    </td>
                    <td>
                        <p>
                            Row 4; column 1 will be empty.
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})
