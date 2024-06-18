import { describe } from 'vitest'
import { RstNodeObject } from '@/RstNode/RstNode.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'

// To keep this test file simple, we do not have any other data in our Document
// Thus, we need to skip these nodes' generated output tests because they reference other nodes in Document
const nodesThatRefOtherNodes = new Set([
    RstNodeType.SubstitutionRef,
    RstNodeType.CitationRef,
    RstNodeType.FootnoteRef,
    RstNodeType.HyperlinkRef,
])

describe.each<{
    nodeType: RstNodeType
    startStr: string
    endStr: string
    bodyText?: string

    htmlStartStr?: string
    htmlEndStr?: string
    mdStartStr?: string
    mdEndStr?: string
    data?: RstNodeObject['data']
}>([
    {
        nodeType: RstNodeType.Emphasis,
        startStr: '*',
        endStr: '*',
        htmlStartStr: '<em>',
        htmlEndStr: '</em>',
        mdStartStr: '*',
        mdEndStr: '*',
    },
    {
        nodeType: RstNodeType.StrongEmphasis,
        startStr: '**',
        endStr: '**',
        htmlStartStr: '<strong>',
        htmlEndStr: '</strong>',
        mdStartStr: '**',
        mdEndStr: '**',
    },
    {
        nodeType: RstNodeType.InterpretedText,
        startStr: '`',
        endStr: '`',
        htmlStartStr: '<cite>',
        htmlEndStr: '</cite>',
        mdStartStr: '*',
        mdEndStr: '*',
        data: {
            role: 'title-reference',
        },
    },
    {
        nodeType: RstNodeType.SubstitutionRef,
        startStr: '|',
        endStr: '|',
    },
    {
        nodeType: RstNodeType.InlineInternalTarget,
        startStr: '_`',
        endStr: '`',
        bodyText: 'Hello World',
        htmlStartStr: '<span class="target" id="hello-world">',
        htmlEndStr: '</span>',
        mdStartStr: '',
        mdEndStr: '',
    },
    {
        nodeType: RstNodeType.FootnoteRef,
        startStr: '[',
        endStr: ']_',
        bodyText: '1',
        data: {
            isAutoSymbol: false,
            isManualLabelNum: true,
        },
    },
    {
        nodeType: RstNodeType.FootnoteRef,
        startStr: '[',
        endStr: ']_',
        bodyText: '#',
        data: {
            isAutoSymbol: false,
            isManualLabelNum: false,
        },
    },
    {
        nodeType: RstNodeType.FootnoteRef,
        startStr: '[',
        endStr: ']_',
        bodyText: '*',
        data: {
            isAutoSymbol: true,
            isManualLabelNum: false,
        },
    },
    {
        nodeType: RstNodeType.CitationRef,
        startStr: '[',
        endStr: ']_',
    },
    {
        nodeType: RstNodeType.HyperlinkRef,
        startStr: '`',
        endStr: '`_',
        bodyText: 'Hello World',
        data: {
            isAlias: true,
        },
    },
    {
        nodeType: RstNodeType.HyperlinkRef,
        startStr: '`',
        endStr: '`__',
        bodyText: 'Hello World',
        data: {
            isAlias: true,
            isAnonymous: true,
        },
    },
])('$nodeType', ({ nodeType, startStr, endStr, bodyText = 'text', htmlStartStr, htmlEndStr, mdStartStr, mdEndStr, data }) => {
    const shouldSkipGeneratorTests = nodesThatRefOtherNodes.has(nodeType)
    const extraFields = data
        ? { data }
        : {}

    describe('when markup is alone, it parses as single child in Paragraph', () => {
        const input = `
            ${startStr}${bodyText}${endStr}
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                children: [
                    {
                        type: nodeType,
                        text: bodyText,
                        ...extraFields,
                    },
                ],
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                ${htmlStartStr}${bodyText}${htmlEndStr}
            </p>
        `, `
            ${mdStartStr}${bodyText}${mdEndStr}
        `)
    })

    describe(`when markup is in the middle of sentence, it parses as [Text, ${nodeType}, Text]`, () => {
        const input = `
            start ${startStr}${bodyText}${endStr} end
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                children: [
                    {
                        type: RstNodeType.Text,
                        text: 'start ',
                    },
                    {
                        type: nodeType,
                        text: bodyText,
                        ...extraFields,
                    },
                    {
                        type: RstNodeType.Text,
                        text: ' end',
                    },
                ],
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                start ${htmlStartStr}${bodyText}${htmlEndStr} end
            </p>
        `, `
            start ${mdStartStr}${bodyText}${mdEndStr} end
        `)
    })

    describe(`when markup is preceded by special punctuation, it parses as ${nodeType}`, () => {
        const input = `
            start :${startStr}${bodyText}${endStr} end
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                children: [
                    {
                        type: RstNodeType.Text,
                        text: 'start :',
                    },
                    {
                        type: nodeType,
                        text: bodyText,
                        ...extraFields,
                    },
                    {
                        type: RstNodeType.Text,
                        text: ' end',
                    },
                ],
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                start :${htmlStartStr}${bodyText}${htmlEndStr} end
            </p>
        `, `
            start :${mdStartStr}${bodyText}${mdEndStr} end
        `)
    })

    describe(`when markup is followed by special punctuation, it parses as ${nodeType}`, () => {
        const input = `
            start ${startStr}${bodyText}${endStr}: end
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                children: [
                    {
                        type: RstNodeType.Text,
                        text: 'start ',
                    },
                    {
                        type: nodeType,
                        text: bodyText,
                        ...extraFields,
                    },
                    {
                        type: RstNodeType.Text,
                        text: ': end',
                    },
                ],
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                start ${htmlStartStr}${bodyText}${htmlEndStr}: end
            </p>
        `, `
            start ${mdStartStr}${bodyText}${mdEndStr}: end
        `)
    })

    describe('when markup is inside whole word, it parses as plaintext', () => {
        const input = `
            thisis${startStr}${bodyText}${endStr}oneword
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                text: `thisis${startStr}${bodyText}${endStr}oneword`,
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                thisis${startStr}${bodyText}${endStr}oneword
            </p>
        `, `
            thisis${startStr}${bodyText}${endStr}oneword
        `)
    })

    describe(`when markup is inside whole word surrounded by escaped whitespace, it parses as ${nodeType}`, () => {
        const input = `
            thisis\\ ${startStr}${bodyText}${endStr}\\ word
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                children: [
                    {
                        type: RstNodeType.Text,
                        text: 'thisis',
                    },
                    {
                        type: nodeType,
                        text: bodyText,
                        ...extraFields,
                    },
                    {
                        type: RstNodeType.Text,
                        text: 'word',
                    },
                ],
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                thisis${htmlStartStr}${bodyText}${htmlEndStr}word
            </p>
        `, `
            thisis${mdStartStr}${bodyText}${mdEndStr}word
        `)
    })

    describe('when startString is wrapped around quotes, it parses as plaintext', () => {
        const input = `
            "${startStr}"test${endStr}
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                text: `"${startStr}"test${endStr}`,
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                &quot;${startStr}&quot;test${endStr}
            </p>
        `, `
            &quot;${startStr}&quot;test${endStr}
        `)
    })

    describe('when startString is escaped, it parses as plaintext', () => {
        const input = `
            \\${startStr}test${endStr}
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                text: `${startStr}test${endStr}`,
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                ${startStr}test${endStr}
            </p>
        `, `
            ${startStr}test${endStr}
        `)
    })

    describe('when endStr is escaped, it parses as plaintext', () => {
        const input = `
            ${startStr}test\\${endStr}
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                text: `${startStr}test${endStr}`,
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                ${startStr}test${endStr}
            </p>
        `, `
            ${startStr}test${endStr}
        `)
    })

    describe(`when there are 2 escape slashes before startString, it parses as single literal slash and ${nodeType}`, () => {
        const input = `
            \\\\ ${startStr}${bodyText}${endStr}
        `

        testParser(input, [
            {
                type: RstNodeType.Paragraph,
                children: [
                    {
                        type: RstNodeType.Text,
                        text: '\\ ',
                    },
                    {
                        type: nodeType,
                        text: bodyText,
                        ...extraFields,
                    },
                ],
            },
        ])

        testGenerator.skipIf(shouldSkipGeneratorTests)(input, `
            <p>
                \\ ${htmlStartStr}${bodyText}${htmlEndStr}
            </p>
        `, `
            \\ ${mdStartStr}${bodyText}${mdEndStr}
        `)
    })
})
