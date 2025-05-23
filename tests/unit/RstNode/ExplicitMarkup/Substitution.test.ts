import { describe, beforeEach, afterEach, vi } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

// ----------------------------------------------------------------------------
// MARK: Image
// ----------------------------------------------------------------------------

describe('image', () => {
    const input = `
        The |biohazard| symbol must be used on containers used to
        dispose of medical waste.

        .. |biohazard| image:: biohazard.png
           :height: 99
           :width: 99
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: 'The ',
                },
                {
                    type: 'SubstitutionRef',
                    text: 'biohazard',
                },
                {
                    type: 'Text',
                    text: ' symbol must be used on containers used to\ndispose of medical waste.',
                },
            ],
        },
        {
            type: 'SubstitutionDef',
            data: {
                directive: 'image',
                needle: 'biohazard',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'biohazard.png',
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
                                        text: 'height',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: '99',
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
                                        text: 'width',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: '99',
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
        <p>
            The <img src="biohazard.png" alt="biohazard" height="99" width="99" /> symbol must be used on containers used to
            dispose of medical waste.
        </p>

        <!-- SubstitutionDef id:16 children:0 needle:"biohazard" directive:"image" initContentText:"biohazard.png" -->
    `, `
        The <img src="biohazard.png" alt="biohazard" height="99" width="99" /> symbol must be used on containers used to
        dispose of medical waste.

        [SubstitutionDef id:16 children:0 needle:"biohazard" directive:"image" initContentText:"biohazard.png"]: #
    `)
})

// ----------------------------------------------------------------------------
// MARK: Text
// ----------------------------------------------------------------------------

describe('text', () => {
    const input = `
        I recommend you try |Python|.

        .. |Python| replace:: Python, *the* best language around
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: 'I recommend you try ',
                },
                {
                    type: 'SubstitutionRef',
                    text: 'Python',
                },
                {
                    type: 'Text',
                    text: '.',
                },
            ],
        },
        {
            type: 'SubstitutionDef',
            data: {
                directive: 'replace',
                needle: 'Python',
            },
            children: [
                {
                    type: 'Paragraph',
                    children: [
                        {
                            type: 'Text',
                            text: 'Python, ',
                        },
                        {
                            type: 'Emphasis',
                            text: 'the',
                        },
                        {
                            type: 'Text',
                            text: ' best language around',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            I recommend you try Python, <em>the</em> best language around.
        </p>

        <!--
            SubstitutionDef id:9 children:1 needle:"Python" directive:"replace"
            <p>
                Python, <em>the</em> best language around
            </p>
        -->
    `, `
        I recommend you try Python, *the* best language around.

        [SubstitutionDef id:9 children:1 needle:"Python" directive:"replace"]: #
        [Python, *the* best language around]: #
    `)
})

describe('text with data starting on second line', () => {
    const input = `
        I read |j2ee-cas|

        .. |j2ee-cas| replace::
           the Java \`TM\`:sup: 2 Platform, Enterprise Edition Client
           Access Services
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: 'I read ',
                },
                {
                    type: 'SubstitutionRef',
                    text: 'j2ee-cas',
                },
            ],
        },
        {
            type: 'SubstitutionDef',
            data: {
                directive: 'replace',
                needle: 'j2ee-cas',
            },
            children: [
                {
                    type: 'Paragraph',
                    children: [
                        {
                            type: 'Text',
                            text: 'the Java ',
                        },
                        {
                            type: 'InterpretedText',
                            text: 'TM',
                            data: {
                                role: 'sup',
                            },
                        },
                        {
                            type: 'Text',
                            text: ' 2 Platform, Enterprise Edition Client\nAccess Services',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            I read the Java <sup>TM</sup> 2 Platform, Enterprise Edition Client
            Access Services
        </p>

        <!--
            SubstitutionDef id:8 children:1 needle:"j2ee-cas" directive:"replace"
            <p>
                the Java <sup>TM</sup> 2 Platform, Enterprise Edition Client
                Access Services
            </p>
        -->
    `, `
        I read the Java ^TM^ 2 Platform, Enterprise Edition Client
        Access Services

        [SubstitutionDef id:8 children:1 needle:"j2ee-cas" directive:"replace"]: #
        [the Java ^TM^ 2 Platform, Enterprise Edition Client]: #
        [Access Services]: #
    `)
})

describe('text with multiline construct', () => {
    const input = `
        |label|

        .. |label| replace:: This documentation is translated from the \`original English one
            <https://docs.godotengine.org/en/stable>\`_ by community members
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'SubstitutionRef',
                    text: 'label',
                },
            ],
        },
        {
            type: 'SubstitutionDef',
            data: {
                directive: 'replace',
                needle: 'label',
            },
            children: [
                {
                    type: 'Paragraph',
                    children: [
                        {
                            type: 'Text',
                            text: 'This documentation is translated from the ',
                        },
                        {
                            type: 'HyperlinkRef',
                            text: 'original English one',
                            data: {
                                label: 'original English one',
                                target: 'https://docs.godotengine.org/en/stable',
                                isEmbeded: true,
                            },
                        },
                        {
                            type: 'Text',
                            text: ' by community members',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            This documentation is translated from the <a href="https://docs.godotengine.org/en/stable">original English one</a> by community members
        </p>

        <!--
            SubstitutionDef id:7 children:1 needle:"label" directive:"replace"
            <p>
                This documentation is translated from the <a href="https://docs.godotengine.org/en/stable">original English one</a> by community members
            </p>
        -->
    `, `
        This documentation is translated from the [original English one](https://docs.godotengine.org/en/stable) by community members

        [SubstitutionDef id:7 children:1 needle:"label" directive:"replace"]: #
        [This documentation is translated from the [original English one](https://docs.godotengine.org/en/stable) by community members]: #
    `)
})

// ----------------------------------------------------------------------------
// MARK: Unicode
// ----------------------------------------------------------------------------

describe('unicode', () => {
    const input = `
        Copyright |copy| 2003, |BogusMegaCorp (TM)| |---|
        all rights reserved.

        .. |copy| unicode:: 0xA9
        .. |BogusMegaCorp (TM)| unicode:: BogusMegaCorp U+2122
           .. with trademark sign
        .. |---| unicode:: U+02014
           :trim:
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: 'Copyright ',
                },
                {
                    type: 'SubstitutionRef',
                    text: 'copy',
                },
                {
                    type: 'Text',
                    text: ' 2003, ',
                },
                {
                    type: 'SubstitutionRef',
                    text: 'BogusMegaCorp (TM)',
                },
                {
                    type: 'Text',
                    text: ' ',
                },
                {
                    type: 'SubstitutionRef',
                    text: '---',
                },
                {
                    type: 'Text',
                    text: '\nall rights reserved.',
                },
            ],
        },
        {
            type: 'SubstitutionDef',
            text: '0xA9',
            data: {
                directive: 'unicode',
                needle: 'copy',
            },
        },
        {
            type: 'SubstitutionDef',
            data: {
                directive: 'unicode',
                needle: 'BogusMegaCorp (TM)',
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'BogusMegaCorp U+2122',
                },
                {
                    type: 'Comment',
                    text: 'with trademark sign',
                },
            ],
        },
        {
            type: 'SubstitutionDef',
            text: 'U+02014',
            data: {
                directive: 'unicode',
                needle: '---',
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'trim',
                                    },
                                ],
                                body: [
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ])

    testGenerator(input, `
        <p>
            Copyright © 2003, BogusMegaCorp ™ —
            all rights reserved.
        </p>

        <!--
            SubstitutionDef id:11 children:1 needle:"copy" directive:"unicode"
            <p>
                0xA9
            </p>
        -->

        <!--
            SubstitutionDef id:15 children:2 needle:"BogusMegaCorp (TM)" directive:"unicode"
            <p>
                BogusMegaCorp U+2122
            </p>
            with trademark sign
        -->

        <!--
            SubstitutionDef id:21 children:1 needle:"---" directive:"unicode"
            <p>
                U+02014
            </p>
        -->
    `, `
        Copyright © 2003, BogusMegaCorp ™ —
        all rights reserved.

        [SubstitutionDef id:11 children:1 needle:"copy" directive:"unicode"]: #
        [0xA9]: #

        [SubstitutionDef id:15 children:2 needle:"BogusMegaCorp (TM)" directive:"unicode"]: #
        [BogusMegaCorp U+2122]: #
        [with trademark sign]: #

        [SubstitutionDef id:21 children:1 needle:"---" directive:"unicode"]: #
        [U+02014]: #
    `)
})

// ----------------------------------------------------------------------------
// MARK: Date
// ----------------------------------------------------------------------------

describe('date', () => {
    const pad4 = (n: number) => n.toString().padStart(4, '0')
    const pad2 = (n: number) => n.toString().padStart(2, '0')
    const year = 2020
    const month = 1
    const day = 1
    const hour = 11
    const min = 22

    const date = new Date(year, month - 1, day, hour, min)
    const dateStr = `${pad4(year)}-${pad2(month)}-${pad2(day)}`
    const timeStr = `${pad2(hour)}:${pad2(min)}`

    beforeEach(() => {
        vi.setSystemTime(date)
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    const input = `
        .. |date| date::
        .. |time| date:: hh:mm

        Today's date is |date|.

        This document was generated on |date| at |time|.
    `

    testParser(input, [
        {
            type: 'SubstitutionDef',
            data: {
                directive: 'date',
                needle: 'date',
            },
        },
        {
            type: 'SubstitutionDef',
            text: 'hh:mm',
            data: {
                directive: 'date',
                needle: 'time',
            },
        },
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: 'Today\'s date is ',
                },
                {
                    type: 'SubstitutionRef',
                    text: 'date',
                },
                {
                    type: 'Text',
                    text: '.',
                },
            ],
        },
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: 'This document was generated on ',
                },
                {
                    type: 'SubstitutionRef',
                    text: 'date',
                },
                {
                    type: 'Text',
                    text: ' at ',
                },
                {
                    type: 'SubstitutionRef',
                    text: 'time',
                },
                {
                    type: 'Text',
                    text: '.',
                },
            ],
        },
    ])

    testGenerator(input, `
        <!-- SubstitutionDef id:1 children:0 needle:"date" directive:"date" -->

        <!--
            SubstitutionDef id:4 children:1 needle:"time" directive:"date"
            <p>
                hh:mm
            </p>
        -->

        <p>
            Today&apos;s date is ${dateStr}.
        </p>

        <p>
            This document was generated on ${dateStr} at ${timeStr}.
        </p>
    `, `
        [SubstitutionDef id:1 children:0 needle:"date" directive:"date"]: #

        [SubstitutionDef id:4 children:1 needle:"time" directive:"date"]: #
        [hh:mm]: #

        Today&apos;s date is ${dateStr}.

        This document was generated on ${dateStr} at ${timeStr}.
    `)
})
