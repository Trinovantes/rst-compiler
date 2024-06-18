import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('no args', () => {
    const input = `
        .. image:: picture.jpg
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'image',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'picture.jpg',
                    },
                ],
            },
        },
    ])

    testGenerator(input, `
        <img src="picture.jpg" />
    `, `
        ![](picture.jpg)
    `)
})

describe('with alt', () => {
    const input = `
        .. image:: picture.jpg
            :alt: desc
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'image',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'picture.jpg',
                    },
                ],
                config: {
                    type: RstNodeType.FieldList,
                    children: [
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'alt',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: 'desc',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ])

    testGenerator(input, `
        <img src="picture.jpg" alt="desc" />
    `, `
        ![desc](picture.jpg)
    `)
})

describe('with size', () => {
    const input = `
        .. image:: picture.jpg
            :width: 100px
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'image',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'picture.jpg',
                    },
                ],
                config: {
                    type: RstNodeType.FieldList,
                    children: [
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'width',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: '100px',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ])

    testGenerator(input, `
        <img src="picture.jpg" width="100px" />
    `)
})

describe('with body content', () => {
    const input = `
        .. figure:: picture.png
            :scale: 50 %
            :alt: map to buried treasure

            This is the caption of the figure (a simple paragraph).

            The legend consists of all elements after the caption.  In this
            case, the legend consists of this paragraph and the following
            table:

            +-----------------------+-----------------------+
            | Symbol                | Meaning               |
            +=======================+=======================+
            | .. image:: tent.png   | Campground            |
            +-----------------------+-----------------------+
            | .. image:: waves.png  | Lake                  |
            +-----------------------+-----------------------+
            | .. image:: peak.png   | Mountain              |
            +-----------------------+-----------------------+
    `

    testParser(input, [
        {
            type: RstNodeType.Directive,
            data: {
                directive: 'figure',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'picture.png',
                    },
                ],
                config: {
                    type: RstNodeType.FieldList,
                    children: [
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'scale',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: '50 %',
                                    },
                                ],
                            },
                        },
                        {
                            type: RstNodeType.FieldListItem,
                            data: {
                                name: [
                                    {
                                        type: RstNodeType.Text,
                                        text: 'alt',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: 'map to buried treasure',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            children: [
                {
                    type: RstNodeType.Paragraph,
                    text: 'This is the caption of the figure (a simple paragraph).',
                },
                {
                    type: RstNodeType.Paragraph,
                    text: 'The legend consists of all elements after the caption.  In this\ncase, the legend consists of this paragraph and the following\ntable:',
                },
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
                                    text: 'Symbol',
                                },
                                {
                                    type: RstNodeType.TableCell,
                                    text: 'Meaning',
                                },
                            ],
                        },
                        {
                            type: RstNodeType.TableRow,
                            children: [
                                {
                                    type: RstNodeType.TableCell,
                                    children: [
                                        {
                                            type: RstNodeType.Directive,
                                            data: {
                                                directive: 'image',
                                                initContent: [
                                                    {
                                                        type: RstNodeType.Paragraph,
                                                        text: 'tent.png',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: RstNodeType.TableCell,
                                    text: 'Campground',
                                },
                            ],
                        },
                        {
                            type: RstNodeType.TableRow,
                            children: [
                                {
                                    type: RstNodeType.TableCell,
                                    children: [
                                        {
                                            type: RstNodeType.Directive,
                                            data: {
                                                directive: 'image',
                                                initContent: [
                                                    {
                                                        type: RstNodeType.Paragraph,
                                                        text: 'waves.png',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: RstNodeType.TableCell,
                                    text: 'Lake',
                                },
                            ],
                        },
                        {
                            type: RstNodeType.TableRow,
                            children: [
                                {
                                    type: RstNodeType.TableCell,
                                    children: [
                                        {
                                            type: RstNodeType.Directive,
                                            data: {
                                                directive: 'image',
                                                initContent: [
                                                    {
                                                        type: RstNodeType.Paragraph,
                                                        text: 'peak.png',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: RstNodeType.TableCell,
                                    text: 'Mountain',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <figure>
            <img src="picture.png" alt="map to buried treasure" />

            <p>
                This is the caption of the figure (a simple paragraph).
            </p>

            <p>
                The legend consists of all elements after the caption.  In this
                case, the legend consists of this paragraph and the following
                table:
            </p>

            <table>
                <thead>
                    <tr>
                        <th>
                            <p>
                                Symbol
                            </p>
                        </th>
                        <th>
                            <p>
                                Meaning
                            </p>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <img src="tent.png" />
                        </td>
                        <td>
                            <p>
                                Campground
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <img src="waves.png" />
                        </td>
                        <td>
                            <p>
                                Lake
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <img src="peak.png" />
                        </td>
                        <td>
                            <p>
                                Mountain
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </figure>
    `, `
        ![map to buried treasure](picture.png)

        This is the caption of the figure (a simple paragraph).

        The legend consists of all elements after the caption.  In this
        case, the legend consists of this paragraph and the following
        table:

        <table>
            <thead>
                <tr>
                    <th>
                        <p>
                            Symbol
                        </p>
                    </th>
                    <th>
                        <p>
                            Meaning
                        </p>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <img src="tent.png" />
                    </td>
                    <td>
                        <p>
                            Campground
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <img src="waves.png" />
                    </td>
                    <td>
                        <p>
                            Lake
                        </p>
                    </td>
                </tr>
                <tr>
                    <td>
                        <img src="peak.png" />
                    </td>
                    <td>
                        <p>
                            Mountain
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    `)
})
