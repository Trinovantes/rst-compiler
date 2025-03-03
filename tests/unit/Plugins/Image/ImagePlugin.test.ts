import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('no args', () => {
    const input = `
        .. image:: picture.jpg
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'image',
                initContent: [
                    {
                        type: 'Paragraph',
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
            type: 'Directive',
            data: {
                directive: 'image',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'picture.jpg',
                    },
                ],
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'alt',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
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
            type: 'Directive',
            data: {
                directive: 'image',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'picture.jpg',
                    },
                ],
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'width',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
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
            type: 'Directive',
            data: {
                directive: 'figure',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'picture.png',
                    },
                ],
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'scale',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: '50 %',
                                    },
                                ],
                            },
                        },
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'alt',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
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
                    type: 'Paragraph',
                    text: 'This is the caption of the figure (a simple paragraph).',
                },
                {
                    type: 'Paragraph',
                    text: 'The legend consists of all elements after the caption.  In this\ncase, the legend consists of this paragraph and the following\ntable:',
                },
                {
                    type: 'Table',
                    children: [
                        {
                            type: 'TableRow',
                            data: {
                                isHeadRow: true,
                            },
                            children: [
                                {
                                    type: 'TableCell',
                                    text: 'Symbol',
                                },
                                {
                                    type: 'TableCell',
                                    text: 'Meaning',
                                },
                            ],
                        },
                        {
                            type: 'TableRow',
                            children: [
                                {
                                    type: 'TableCell',
                                    children: [
                                        {
                                            type: 'Directive',
                                            data: {
                                                directive: 'image',
                                                initContent: [
                                                    {
                                                        type: 'Paragraph',
                                                        text: 'tent.png',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: 'TableCell',
                                    text: 'Campground',
                                },
                            ],
                        },
                        {
                            type: 'TableRow',
                            children: [
                                {
                                    type: 'TableCell',
                                    children: [
                                        {
                                            type: 'Directive',
                                            data: {
                                                directive: 'image',
                                                initContent: [
                                                    {
                                                        type: 'Paragraph',
                                                        text: 'waves.png',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: 'TableCell',
                                    text: 'Lake',
                                },
                            ],
                        },
                        {
                            type: 'TableRow',
                            children: [
                                {
                                    type: 'TableCell',
                                    children: [
                                        {
                                            type: 'Directive',
                                            data: {
                                                directive: 'image',
                                                initContent: [
                                                    {
                                                        type: 'Paragraph',
                                                        text: 'peak.png',
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: 'TableCell',
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
