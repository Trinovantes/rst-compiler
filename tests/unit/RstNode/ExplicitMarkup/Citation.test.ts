import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('single CitationRef and CitationDef', () => {
    const input = `
        TEXT [label]_ TEXT

        .. [label] citation
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.Text,
                    text: 'TEXT ',
                },
                {
                    type: RstNodeType.CitationRef,
                    text: 'label',
                },
                {
                    type: RstNodeType.Text,
                    text: ' TEXT',
                },
            ],
        },
        {
            type: RstNodeType.CitationDefGroup,
            children: [
                {
                    type: RstNodeType.CitationDef,
                    text: 'citation',
                    data: {
                        label: 'label',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            TEXT <a href="#label" id="citationref-1" class="citation-reference">label</a> TEXT
        </p>

        <dl class="citations">
            <dt id="label">
                <span class="citation-definition">
                    label
                    <span class="backlinks">
                        <a href="#citationref-1">[1]</a>
                    </span>
                </span>
            </dt>
            <dd>
                <p>
                    citation
                </p>
            </dd>
        </dl>
    `, `
        TEXT [^1] TEXT

        [^1]:
            citation
    `)
})

describe('multiple CitationRefs and CitationDefs', () => {
    const input = `
        Hello [label1]_ World [label2]_

        .. [label1] citation 1

        .. [label2] citation 2
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.Text,
                    text: 'Hello ',
                },
                {
                    type: RstNodeType.CitationRef,
                    text: 'label1',
                },
                {
                    type: RstNodeType.Text,
                    text: ' World ',
                },
                {
                    type: RstNodeType.CitationRef,
                    text: 'label2',
                },
            ],
        },
        {
            type: RstNodeType.CitationDefGroup,
            children: [
                {
                    type: RstNodeType.CitationDef,
                    text: 'citation 1',
                    data: {
                        label: 'label1',
                    },
                },
                {
                    type: RstNodeType.CitationDef,
                    text: 'citation 2',
                    data: {
                        label: 'label2',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            Hello <a href="#label1" id="citationref-1" class="citation-reference">label1</a> World <a href="#label2" id="citationref-2" class="citation-reference">label2</a>
        </p>

        <dl class="citations">
            <dt id="label1">
                <span class="citation-definition">
                    label1
                    <span class="backlinks">
                        <a href="#citationref-1">[1]</a>
                    </span>
                </span>
            </dt>
            <dd>
                <p>
                    citation 1
                </p>
            </dd>

            <dt id="label2">
                <span class="citation-definition">
                    label2
                    <span class="backlinks">
                        <a href="#citationref-2">[1]</a>
                    </span>
                </span>
            </dt>
            <dd>
                <p>
                    citation 2
                </p>
            </dd>
        </dl>
    `, `
        Hello [^1] World [^2]

        [^1]:
            citation 1

        [^2]:
            citation 2
    `)
})

describe('when there is a Blockquote in CitationDef, it parses as child of CitationDef', () => {
    const input = `
        .. [label] paragraph 1 line 1
           paragraph 1 line 2

               blockquote

           paragraph 2
    `

    testParser(input, [
        {
            type: RstNodeType.CitationDefGroup,
            children: [
                {
                    type: RstNodeType.CitationDef,
                    data: {
                        label: 'label',
                    },
                    children: [
                        {
                            type: RstNodeType.Paragraph,
                            text: 'paragraph 1 line 1\nparagraph 1 line 2',
                        },
                        {
                            type: RstNodeType.Blockquote,
                            text: 'blockquote',
                        },
                        {
                            type: RstNodeType.Paragraph,
                            text: 'paragraph 2',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl class="citations">
            <dt id="label">
                <span class="citation-definition">
                    label
                </span>
            </dt>
            <dd>
                <p>
                    paragraph 1 line 1
                    paragraph 1 line 2
                </p>

                <blockquote>
                    <p>
                        blockquote
                    </p>
                </blockquote>

                <p>
                    paragraph 2
                </p>
            </dd>
        </dl>
    `, `
        [^1]:
            paragraph 1 line 1
            paragraph 1 line 2

            > blockquote

            paragraph 2
    `)
})

describe('when line has multiple square brackets, the text between first and last bracket should not parse as CitationRef', () => {
    const input = `
        [1] this sentence is not inside citation [note]_
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.Text,
                    text: '[1] this sentence is not inside citation ',
                },
                {
                    type: RstNodeType.CitationRef,
                    text: 'note',
                },
            ],
        },
    ])
})
