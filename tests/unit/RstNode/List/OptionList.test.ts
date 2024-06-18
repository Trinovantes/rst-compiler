import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('OptionList', () => {
    describe('short-form without arg', () => {
        const input = `
            -f  Desc
        `

        testParser(input, [
            {
                type: RstNodeType.OptionList,
                children: [
                    {
                        type: RstNodeType.OptionListItem,
                        text: 'Desc',
                        data: {
                            options: [
                                {
                                    name: '-f',
                                    delimiter: undefined,
                                    rawArgName: undefined,
                                },
                            ],
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <dl class="option-list">
                <dt>
                    <kbd><span class="option">-f</span></kbd>
                </dt>
                <dd>
                    <p>
                        Desc
                    </p>
                </dd>
            </dl>
        `, `
            \`-f\`

            Desc
        `)
    })

    describe('short-form with arg', () => {
        const input = `
            -f FILE  Desc
        `

        testParser(input, [
            {
                type: RstNodeType.OptionList,
                children: [
                    {
                        type: RstNodeType.OptionListItem,
                        text: 'Desc',
                        data: {
                            options: [
                                {
                                    name: '-f',
                                    delimiter: ' ',
                                    rawArgName: 'FILE',
                                },
                            ],
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <dl class="option-list">
                <dt>
                    <kbd><span class="option">-f <var>FILE</var></span></kbd>
                </dt>
                <dd>
                    <p>
                        Desc
                    </p>
                </dd>
            </dl>
        `, `
            \`-f FILE\`

            Desc
        `)
    })

    describe('long-form without arg', () => {
        const input = `
            --f  Desc
        `

        testParser(input, [
            {
                type: RstNodeType.OptionList,
                children: [
                    {
                        type: RstNodeType.OptionListItem,
                        text: 'Desc',
                        data: {
                            options: [
                                {
                                    name: '--f',
                                    delimiter: undefined,
                                    rawArgName: undefined,
                                },
                            ],
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <dl class="option-list">
                <dt>
                    <kbd><span class="option">--f</span></kbd>
                </dt>
                <dd>
                    <p>
                        Desc
                    </p>
                </dd>
            </dl>
        `, `
            \`--f\`

            Desc
        `)
    })

    describe('long-form with arg', () => {
        const input = `
            --f FILE  Desc
        `

        testParser(input, [
            {
                type: RstNodeType.OptionList,
                children: [
                    {
                        type: RstNodeType.OptionListItem,
                        text: 'Desc',
                        data: {
                            options: [
                                {
                                    name: '--f',
                                    delimiter: ' ',
                                    rawArgName: 'FILE',
                                },
                            ],
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <dl class="option-list">
                <dt>
                    <kbd><span class="option">--f <var>FILE</var></span></kbd>
                </dt>
                <dd>
                    <p>
                        Desc
                    </p>
                </dd>
            </dl>
        `, `
            \`--f FILE\`

            Desc
        `)
    })

    describe('DOS/VMS form', () => {
        const input = `
            /V  Desc
        `

        testParser(input, [
            {
                type: RstNodeType.OptionList,
                children: [
                    {
                        type: RstNodeType.OptionListItem,
                        text: 'Desc',
                        data: {
                            options: [
                                {
                                    name: '/V',
                                    delimiter: undefined,
                                    rawArgName: undefined,
                                },
                            ],
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <dl class="option-list">
                <dt>
                    <kbd><span class="option">/V</span></kbd>
                </dt>
                <dd>
                    <p>
                        Desc
                    </p>
                </dd>
            </dl>
        `, `
            \`/V\`

            Desc
        `)
    })
})

describe('when following lines are on different indentation, it parses as same Paragraph of desc', () => {
    const input = `
        -f FILE  Desc 1
            Desc 2
            Desc 3
    `

    testParser(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    text: 'Desc 1\nDesc 2\nDesc 3',
                    data: {
                        options: [
                            {
                                name: '-f',
                                delimiter: ' ',
                                rawArgName: 'FILE',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="option-list">
            <dt>
                <kbd><span class="option">-f <var>FILE</var></span></kbd>
            </dt>
            <dd>
                <p>
                    Desc 1
                    Desc 2
                    Desc 3
                </p>
            </dd>
        </dl>
    `, `
        \`-f FILE\`

        Desc 1
        Desc 2
        Desc 3
    `)
})

describe('when desc is blank on option line without arg, it parses Paragraph starting on next line', () => {
    const input = `
        -f
            Desc
    `

    testParser(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    text: 'Desc',
                    data: {
                        options: [
                            {
                                name: '-f',
                                delimiter: undefined,
                                rawArgName: undefined,
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="option-list">
            <dt>
                <kbd><span class="option">-f</span></kbd>
            </dt>
            <dd>
                <p>
                    Desc
                </p>
            </dd>
        </dl>
    `, `
        \`-f\`

        Desc
    `)
})

describe('when desc is blank on option line with arg, it parses Paragraph starting on next line', () => {
    const input = `
        -f FILE
            Desc
    `

    testParser(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    text: 'Desc',
                    data: {
                        options: [
                            {
                                name: '-f',
                                delimiter: ' ',
                                rawArgName: 'FILE',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="option-list">
            <dt>
                <kbd><span class="option">-f <var>FILE</var></span></kbd>
            </dt>
            <dd>
                <p>
                    Desc
                </p>
            </dd>
        </dl>
    `, `
        \`-f FILE\`

        Desc
    `)
})

describe('when multiple options are delimited by commas, it parses as multiple options in same OptionListItem', () => {
    const input = `
        -f FILE1, --file=FILE2, -f <any[]character here>
            Desc
    `

    testParser(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    text: 'Desc',
                    data: {
                        options: [
                            {
                                name: '-f',
                                delimiter: ' ',
                                rawArgName: 'FILE1',
                            },
                            {
                                name: '--file',
                                delimiter: '=',
                                rawArgName: 'FILE2',
                            },
                            {
                                name: '-f',
                                delimiter: ' ',
                                rawArgName: '<any[]character here>',
                            },
                        ],
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="option-list">
            <dt>
                <kbd><span class="option">-f <var>FILE1</var></span>, <span class="option">--file=<var>FILE2</var></span>, <span class="option">-f <var>&lt;any[]character here&gt;</var></span></kbd>
            </dt>
            <dd>
                <p>
                    Desc
                </p>
            </dd>
        </dl>
    `, `
        \`-f FILE1, --file=FILE2, -f <any[]character here>\`

        Desc
    `)
})

describe('when option starts with escape character, it parses as DefinitionList instead', () => {
    const input = `
        \\-term 5
            Without escaping, this would be an option list item.
    `

    testParser(input, [
        {
            type: RstNodeType.DefinitionList,
            children: [
                {
                    type: RstNodeType.DefinitionListItem,
                    data: {
                        term: [
                            {
                                type: RstNodeType.Text,
                                text: '-term 5',
                            },
                        ],
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

    testGenerator(input, `
        <dl>
            <dt>
                -term 5
            </dt>
            <dd>
                <p>
                    Without escaping, this would be an option list item.
                </p>
            </dd>
        </dl>
    `, `
        **-term 5**

        Without escaping, this would be an option list item.
    `)
})

describe('multiple options parse as single list', () => {
    const input = `
        -a          Output all.
        -c arg      Output just arg.

        --long      Output all day long.
        /V          A VMS/DOS-style option.

        -p          This option has two paragraphs in the description.
                    This is the first.

                    This is the second.
                    Blank lines may be omitted between options
                    (as above) or left in (as here and below).
    `

    testParser(input, [
        {
            type: RstNodeType.OptionList,
            children: [
                {
                    type: RstNodeType.OptionListItem,
                    text: 'Output all.',
                    data: {
                        options: [
                            {
                                name: '-a',
                                delimiter: undefined,
                                rawArgName: undefined,
                            },
                        ],
                    },
                },
                {
                    type: RstNodeType.OptionListItem,
                    text: 'Output just arg.',
                    data: {
                        options: [
                            {
                                name: '-c',
                                delimiter: ' ',
                                rawArgName: 'arg',
                            },
                        ],
                    },
                },
                {
                    type: RstNodeType.OptionListItem,
                    text: 'Output all day long.',
                    data: {
                        options: [
                            {
                                name: '--long',
                                delimiter: undefined,
                                rawArgName: undefined,
                            },
                        ],
                    },
                },
                {
                    type: RstNodeType.OptionListItem,
                    text: 'A VMS/DOS-style option.',
                    data: {
                        options: [
                            {
                                name: '/V',
                                delimiter: undefined,
                                rawArgName: undefined,
                            },
                        ],
                    },
                },
                {
                    type: RstNodeType.OptionListItem,
                    data: {
                        options: [
                            {
                                name: '-p',
                                delimiter: undefined,
                                rawArgName: undefined,
                            },
                        ],
                    },
                    children: [
                        {
                            type: RstNodeType.Paragraph,
                            text: 'This option has two paragraphs in the description.\nThis is the first.',
                        },
                        {
                            type: RstNodeType.Paragraph,
                            text: 'This is the second.\nBlank lines may be omitted between options\n(as above) or left in (as here and below).',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="option-list">
            <dt>
                <kbd><span class="option">-a</span></kbd>
            </dt>
            <dd>
                <p>
                    Output all.
                </p>
            </dd>

            <dt>
                <kbd><span class="option">-c <var>arg</var></span></kbd>
            </dt>
            <dd>
                <p>
                    Output just arg.
                </p>
            </dd>

            <dt>
                <kbd><span class="option">--long</span></kbd>
            </dt>
            <dd>
                <p>
                    Output all day long.
                </p>
            </dd>

            <dt>
                <kbd><span class="option">/V</span></kbd>
            </dt>
            <dd>
                <p>
                    A VMS/DOS-style option.
                </p>
            </dd>

            <dt>
                <kbd><span class="option">-p</span></kbd>
            </dt>
            <dd>
                <p>
                    This option has two paragraphs in the description.
                    This is the first.
                </p>

                <p>
                    This is the second.
                    Blank lines may be omitted between options
                    (as above) or left in (as here and below).
                </p>
            </dd>
        </dl>
    `, `
        \`-a\`

        Output all.

        \`-c arg\`

        Output just arg.

        \`--long\`

        Output all day long.

        \`/V\`

        A VMS/DOS-style option.

        \`-p\`

        This option has two paragraphs in the description.
        This is the first.

        This is the second.
        Blank lines may be omitted between options
        (as above) or left in (as here and below).
    `)
})
