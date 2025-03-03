import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('when text is wrapped in colons, it parses as FieldListItem without any body', () => {
    const input = `
        :key:
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'key',
                            },
                        ],
                        body: [
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="docinfo">
            <dt class="key">
                key
            </dt>
            <dd class="key">
            </dd>
        </dl>
    `, `
        **key**

    `)
})

describe('when text follows the second colon, it parses as FieldListItem with body', () => {
    const input = `
        :key: value
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'key',
                            },
                        ],
                        body: [
                            {
                                type: 'Paragraph',
                                text: 'value',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="docinfo">
            <dt class="key">
                key
            </dt>
            <dd class="key">
                <p>
                    value
                </p>
            </dd>
        </dl>
    `, `
        **key**

        value
    `)
})

describe('when multiple FieldListItems are in a row without linebreaks, they parse as separate FieldListItems', () => {
    const input = `
        :key1: value1
        :key2:
        :key3: value3
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'key1',
                            },
                        ],
                        body: [
                            {
                                type: 'Paragraph',
                                text: 'value1',
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
                                text: 'key2',
                            },
                        ],
                        body: [
                        ],
                    },
                },
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'key3',
                            },
                        ],
                        body: [
                            {
                                type: 'Paragraph',
                                text: 'value3',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="docinfo">
            <dt class="key1">
                key1
            </dt>
            <dd class="key1">
                <p>
                    value1
                </p>
            </dd>

            <dt class="key2">
                key2
            </dt>
            <dd class="key2">
            </dd>

            <dt class="key3">
                key3
            </dt>
            <dd class="key3">
                <p>
                    value3
                </p>
            </dd>
        </dl>
    `, `
        **key1**

        value1

        **key2**


        **key3**

        value3
    `)
})

describe('when multiline body does align with colon, it parses as single FieldListItem', () => {
    const input = `
        :Authors: - Me
                  - Myself
                  - I
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'Authors',
                            },
                        ],
                        body: [
                            {
                                type: 'BulletList',
                                children: [
                                    {
                                        type: 'BulletListItem',
                                        text: 'Me',
                                        data: {
                                            bullet: '-',
                                        },
                                    },
                                    {
                                        type: 'BulletListItem',
                                        text: 'Myself',
                                        data: {
                                            bullet: '-',
                                        },
                                    },
                                    {
                                        type: 'BulletListItem',
                                        text: 'I',
                                        data: {
                                            bullet: '-',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="docinfo">
            <dt class="authors">
                Authors
            </dt>
            <dd class="authors">
                <ul>
                    <li>
                        <p>
                            Me
                        </p>
                    </li>

                    <li>
                        <p>
                            Myself
                        </p>
                    </li>

                    <li>
                        <p>
                            I
                        </p>
                    </li>
                </ul>
            </dd>
        </dl>
    `, `
        **Authors**

        - Me

        - Myself

        - I
    `)
})

describe('when field name contains spaces, it is converted to slug form in html dt/dd class', () => {
    const input = `
        :Parameter i: integer
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'Parameter i',
                            },
                        ],
                        body: [
                            {
                                type: 'Paragraph',
                                text: 'integer',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="docinfo">
            <dt class="parameter-i">
                Parameter i
            </dt>
            <dd class="parameter-i">
                <p>
                    integer
                </p>
            </dd>
        </dl>
    `, `
        **Parameter i**

        integer
    `)
})

describe('when FieldListItem name has InterpretedText with role suffix, it parses as FieldListItem', () => {
    const input = `
        :\`field name\`:code:: interpreted text with explicit role as suffix
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'InterpretedText',
                                text: 'field name',
                                data: {
                                    role: 'code',
                                },
                            },
                        ],
                        body: [
                            {
                                type: 'Paragraph',
                                text: 'interpreted text with explicit role as suffix',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

describe('when FieldListItem name has InterpretedText with role suffix followed by escaped space, it parses as FieldListItem', () => {
    const input = `
        :a \`complex\`:code:\\ field name: a backslash-escaped space
                                           is necessary
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'a ',
                            },
                            {
                                type: 'InterpretedText',
                                text: 'complex',
                                data: {
                                    role: 'code',
                                },
                            },
                            {
                                type: 'Text',
                                text: 'field name',
                            },
                        ],
                        body: [
                            {
                                type: 'Paragraph',
                                text: 'a backslash-escaped space\nis necessary',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

describe('when FieldListItem name has InterpretedText that is preceded by escaped colon, it parses as InterpretedText with no role', () => {
    const input = `
        :field\\:\`name\`: interpreted text (standard role) requires
                           escaping the leading colon in a field name
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'field:',
                            },
                            {
                                type: 'InterpretedText',
                                text: 'name',
                                data: {
                                    role: 'title-reference',
                                },
                            },
                        ],
                        body: [
                            {
                                type: 'Paragraph',
                                text: 'interpreted text (standard role) requires\nescaping the leading colon in a field name',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

describe('when InterpretedText with role prefix followed by colon, it should not parse as FieldListItem', () => {
    const input = `
        :code:\`not a field name\`: paragraph with interpreted text
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'InterpretedText',
                    text: 'not a field name',
                    data: {
                        role: 'code',
                    },
                },
                {
                    type: 'Text',
                    text: ': paragraph with interpreted text',
                },
            ],
        },
    ])
})

describe('when InterpretedText with role prefix followed by colon and preceded by colon, it should not parse as FieldListItem', () => {
    const input = `
        ::code:\`not a field name\`: paragraph with interpreted text
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: ':',
                },
                {
                    type: 'InterpretedText',
                    text: 'not a field name',
                    data: {
                        role: 'code',
                    },
                },
                {
                    type: 'Text',
                    text: ': paragraph with interpreted text',
                },
            ],
        },
    ])
})

describe('when InterpretedText with role prefix followed by colon and preceded by colon and escaped space, it should not parse as FieldListItem', () => {
    const input = `
        :\\ :code:\`not a field name\`: paragraph with interpreted text
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: ':',
                },
                {
                    type: 'InterpretedText',
                    text: 'not a field name',
                    data: {
                        role: 'code',
                    },
                },
                {
                    type: 'Text',
                    text: ': paragraph with interpreted text',
                },
            ],
        },
    ])
})

describe('when InterpretedText with role has its starting backtick escaped, it should not parse as InterpretedText', () => {
    const input = `
        :field:\\\`name\`: not interpreted text
    `

    testParser(input, [
        {
            type: 'FieldList',
            children: [
                {
                    type: 'FieldListItem',
                    data: {
                        name: [
                            {
                                type: 'Text',
                                text: 'field:`name`',
                            },
                        ],
                        body: [
                            {
                                type: 'Paragraph',
                                text: 'not interpreted text',
                            },
                        ],
                    },
                },
            ],
        },
    ])
})

describe('when InterpretedText with role has its ending backtick escaped, it should not parse as InterpretedText or FieldListItem', () => {
    // This cannot parse as FieldListItem because of regex limitations
    // We only allow colon (:) inside FieldListItem name when it's not immediately followed by backtick (`) otherwise it's possibly a InterpretedText with prefix role
    // However, we cannot use regex to determine that the following backtick is NOT the start of an InterpretedText (without expensive lookahead)
    //
    //         Impossible to tell if this is start of InterpretedText without unrestricted lookahead
    //         |
    //  :field:`name\`
    //
    // In theory it's possible to determine the purpose of the (`) with an actual state machine parser
    // but it's too much work vs simply using regex and assume the user will not write this crazy edge case

    const input = `
        :field:\`name\\\`: not interpreted text or field list item
    `

    testParser(input, [
        {
            type: 'Paragraph',
            text: ':field:`name`: not interpreted text or field list item',
        },
    ])
})
