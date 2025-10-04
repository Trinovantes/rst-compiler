import { normalizeSimpleName } from '../../../../src/SimpleName.ts'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe, expect, test } from 'vitest'
import { parseTestInputForGeneratorState } from 'tests/fixtures/parseTestInput.js'
import { RstToHtmlCompiler } from '../../../../src/RstCompiler.ts'

// ----------------------------------------------------------------------------
// MARK: InlineInternalTarget
// ----------------------------------------------------------------------------

describe('InlineInternalTarget', () => {
    const input = `
        Oh yes, the _\`Norwegian Blue\`.  What's, um, what's wrong with it?
    `

    testParser(input, [
        {
            type: 'Paragraph',
            children: [
                {
                    type: 'Text',
                    text: 'Oh yes, the ',
                },
                {
                    type: 'InlineInternalTarget',
                    text: 'Norwegian Blue',
                },
                {
                    type: 'Text',
                    text: ".  What's, um, what's wrong with it?",
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            Oh yes, the <span class="target" id="norwegian-blue">Norwegian Blue</span>.  What&apos;s, um, what&apos;s wrong with it?
        </p>
    `, `
        Oh yes, the Norwegian Blue.  What&apos;s, um, what&apos;s wrong with it?
    `)

    test('resolves SimpleName to normalized form of own text', () => {
        const generatorState = parseTestInputForGeneratorState(input)
        const internalTarget = generatorState.root.findAllChildren('InlineInternalTarget')[0]

        expect(generatorState.simpleNameResolver.getSimpleName(internalTarget)).toBe('norwegian-blue')
        expect(generatorState.resolveNodeToUrl(internalTarget)).toBe('#norwegian-blue')
    })

    test('other HyperlinkRef can reference InlineInternalTarget', () => {
        const input = `
            Oh yes, the _\`Norwegian Blue\`.  What's, um, what's wrong with it?

            .. _alias: Norwegian Blue_
        `

        const generatorState = parseTestInputForGeneratorState(input)
        const hyperlinkTarget = generatorState.root.findAllChildren('HyperlinkTarget')[0]

        expect(generatorState.simpleNameResolver.getSimpleName(hyperlinkTarget)).toBe('alias')
        expect(generatorState.resolveNodeToUrl(hyperlinkTarget)).toBe('#norwegian-blue')
    })
})

// ----------------------------------------------------------------------------
// MARK: HyperlinkTarget
// ----------------------------------------------------------------------------

describe('HyperlinkTarget', () => {
    describe('explicit external', () => {
        const input = `
            .. _label: https://www.python.org/
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'label',
                    target: 'https://www.python.org/',
                },
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"label" target:"https://www.python.org/" resolvedUrl:"https://www.python.org/" -->
        `, `
            [HyperlinkTarget id:1 children:0 label:"label" target:"https://www.python.org/" resolvedUrl:"https://www.python.org/"]: #
        `)
    })

    describe('anonymous external', () => {
        const input = `
            .. __: https://www.python.org/
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: '_',
                    target: 'https://www.python.org/',
                    isAnonymous: true,
                },
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"_" target:"https://www.python.org/" isAnonymous:true resolvedUrl:"https://www.python.org/" -->
        `, `
            [HyperlinkTarget id:1 children:0 label:"_" target:"https://www.python.org/" isAnonymous:true resolvedUrl:"https://www.python.org/"]: #
        `)
    })

    describe('anonymous external (alternative short form)', () => {
        const input = `
            __ https://www.python.org/
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: '_',
                    target: 'https://www.python.org/',
                    isAnonymous: true,
                },
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"_" target:"https://www.python.org/" isAnonymous:true resolvedUrl:"https://www.python.org/" -->
        `, `
            [HyperlinkTarget id:1 children:0 label:"_" target:"https://www.python.org/" isAnonymous:true resolvedUrl:"https://www.python.org/"]: #
        `)
    })

    describe('chained internal', () => {
        const input = `
            __
            .. _target1:
            .. _target2:

            The targets "target1" and "target2" are synonyms; they both
            point to this paragraph.
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: '_',
                    target: '',
                    isTargetingNextNode: true,
                    isAnonymous: true,
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'target1',
                    target: '',
                    isTargetingNextNode: true,
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'target2',
                    target: '',
                    isTargetingNextNode: true,
                },
            },
            {
                type: 'Paragraph',
                text: 'The targets "target1" and "target2" are synonyms; they both\npoint to this paragraph.',
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"_" target:"" isAnonymous:true isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1" -->

            <!-- HyperlinkTarget id:2 children:0 label:"target1" target:"" isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1" -->

            <!-- HyperlinkTarget id:3 children:0 label:"target2" target:"" isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1" -->

            <p id="anonymous-hyperlinktarget-1">
                The targets &quot;target1&quot; and &quot;target2&quot; are synonyms; they both
                point to this paragraph.
            </p>
        `, `
            [HyperlinkTarget id:1 children:0 label:"_" target:"" isAnonymous:true isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1"]: #

            [HyperlinkTarget id:2 children:0 label:"target1" target:"" isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1"]: #

            [HyperlinkTarget id:3 children:0 label:"target2" target:"" isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1"]: #

            The targets &quot;target1&quot; and &quot;target2&quot; are synonyms; they both
            point to this paragraph.
        `)
    })

    describe('chained internal to node with predefined name', () => {
        const input = `
            __
            .. _target1:
            .. _target2:

            .. [cite] citation
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: '_',
                    target: '',
                    isTargetingNextNode: true,
                    isAnonymous: true,
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'target1',
                    target: '',
                    isTargetingNextNode: true,
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'target2',
                    target: '',
                    isTargetingNextNode: true,
                },
            },
            {
                type: 'CitationDefGroup',
                children: [
                    {
                        type: 'CitationDef',
                        text: 'citation',
                        data: {
                            label: 'cite',
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"_" target:"" isAnonymous:true isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1" -->

            <!-- HyperlinkTarget id:2 children:0 label:"target1" target:"" isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1" -->

            <!-- HyperlinkTarget id:3 children:0 label:"target2" target:"" isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1" -->

            <dl id="anonymous-hyperlinktarget-1" class="citations">
                <dt id="cite">
                    <span class="citation-definition">
                        cite
                    </span>
                </dt>
                <dd>
                    <p>
                        citation
                    </p>
                </dd>
            </dl>
        `, `
            [HyperlinkTarget id:1 children:0 label:"_" target:"" isAnonymous:true isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1"]: #

            [HyperlinkTarget id:2 children:0 label:"target1" target:"" isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1"]: #

            [HyperlinkTarget id:3 children:0 label:"target2" target:"" isTargetingNextNode:true resolvedUrl:"#anonymous-hyperlinktarget-1"]: #

            [^1]:
                citation
        `)
    })

    test('chained internal to external url', () => {
        const input = `
            .. _target1:
            .. _target2:
            .. _Doc-SIG: https://mail.python.org/pipermail/doc-sig/
        `

        const generatorState = parseTestInputForGeneratorState(input)

        expect(generatorState.resolveSimpleNameToUrl(normalizeSimpleName('target1'))).toBe('https://mail.python.org/pipermail/doc-sig/')
        expect(generatorState.resolveSimpleNameToUrl(normalizeSimpleName('target2'))).toBe('https://mail.python.org/pipermail/doc-sig/')
        expect(generatorState.resolveSimpleNameToUrl(normalizeSimpleName('Doc-SIG'))).toBe('https://mail.python.org/pipermail/doc-sig/')
    })

    describe('indirect targets', () => {
        const input = `
            Hello \`one\`_ World

            .. _one: two_
            .. _two: three_
            .. _three: hello-world
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'Text',
                        text: 'Hello ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'one',
                        data: {
                            isAlias: true,
                        },
                    },
                    {
                        type: 'Text',
                        text: ' World',
                    },
                ],
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'one',
                    target: 'two_',
                    isAlias: true,
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'two',
                    target: 'three_',
                    isAlias: true,
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'three',
                    target: 'hello-world',
                },
            },
        ])

        testGenerator(input, `
            <p>
                Hello <a href="hello-world">one</a> World
            </p>

            <!-- HyperlinkTarget id:5 children:0 label:"one" target:"two_" isAlias:true resolvedUrl:"hello-world" -->

            <!-- HyperlinkTarget id:6 children:0 label:"two" target:"three_" isAlias:true resolvedUrl:"hello-world" -->

            <!-- HyperlinkTarget id:7 children:0 label:"three" target:"hello-world" resolvedUrl:"hello-world" -->
        `, `
            Hello [one](hello-world) World

            [HyperlinkTarget id:5 children:0 label:"one" target:"two_" isAlias:true resolvedUrl:"hello-world"]: #

            [HyperlinkTarget id:6 children:0 label:"two" target:"three_" isAlias:true resolvedUrl:"hello-world"]: #

            [HyperlinkTarget id:7 children:0 label:"three" target:"hello-world" resolvedUrl:"hello-world"]: #
        `)
    })

    describe('when HyperlinkTarget label contains colons, they need to be enclosed in backquotes', () => {
        const input = `
            .. _\`FAQTS: Computers: Programming: Languages: Python\`:
               http://python.faqts.com/
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'FAQTS: Computers: Programming: Languages: Python',
                    target: 'http://python.faqts.com/',
                },
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"FAQTS: Computers: Programming: Languages: Python" target:"http://python.faqts.com/" resolvedUrl:"http://python.faqts.com/" -->
        `, `
            [HyperlinkTarget id:1 children:0 label:"FAQTS: Computers: Programming: Languages: Python" target:"http://python.faqts.com/" resolvedUrl:"http://python.faqts.com/"]: #
        `)
    })

    describe('when HyperlinkTarget label contains colons, they need to be escaped', () => {
        const input = `
            .. _Chapter One\\: "Tadpole Days":

            Hello World
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'Chapter One: "Tadpole Days"',
                    target: '',
                    isTargetingNextNode: true,
                },
            },
            {
                type: 'Paragraph',
                text: 'Hello World',
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"Chapter One: "Tadpole Days"" target:"" isTargetingNextNode:true resolvedUrl:"#chapter-one-tadpole-days" -->

            <p id="chapter-one-tadpole-days">
                Hello World
            </p>
        `, `
            [HyperlinkTarget id:1 children:0 label:"Chapter One: "Tadpole Days"" target:"" isTargetingNextNode:true resolvedUrl:"#chapter-one-tadpole-days"]: #

            Hello World
        `)
    })

    describe('when HyperlinkTarget url is split to multiple lines, it parses as a single word', () => {
        const input = `
            .. _label: https://google.ca
               /really
               /long
               /link
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'label',
                    target: 'https://google.ca/really/long/link',
                },
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"label" target:"https://google.ca/really/long/link" resolvedUrl:"https://google.ca/really/long/link" -->
        `, `
            [HyperlinkTarget id:1 children:0 label:"label" target:"https://google.ca/really/long/link" resolvedUrl:"https://google.ca/really/long/link"]: #
        `)
    })

    describe('when HyperlinkTarget url contains spaces, they must be escaped', () => {
        const input = `
            .. _reference: ../local\\ path\\ with\\ spaces.html
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'reference',
                    target: '../local path with spaces.html',
                },
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"reference" target:"../local path with spaces.html" resolvedUrl:"../local path with spaces.html" -->
        `, `
            [HyperlinkTarget id:1 children:0 label:"reference" target:"../local path with spaces.html" resolvedUrl:"../local path with spaces.html"]: #
        `)
    })

    describe('when HyperlinkTarget url contains trailing underscore, it must be escaped', () => {
        const input = `
            .. _label: link\\_

            Hello \`label\`_ World
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'label',
                    target: 'link_',
                },
            },
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'Text',
                        text: 'Hello ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'label',
                        data: {
                            isAlias: true,
                        },
                    },
                    {
                        type: 'Text',
                        text: ' World',
                    },
                ],
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:"label" target:"link_" resolvedUrl:"link_" -->

            <p>
                Hello <a href="link_">label</a> World
            </p>
        `, `
            [HyperlinkTarget id:1 children:0 label:"label" target:"link_" resolvedUrl:"link_"]: #

            Hello [label](link_) World
        `)
    })
})

// ----------------------------------------------------------------------------
// MARK: HyperlinkRef
// ----------------------------------------------------------------------------

describe('HyperlinkRef', () => {
    describe('when HyperlinkRef embeded target ends with underscore, it must be escaped', () => {
        const input = `
            Use the \`source <parrots.txt\\_>\`__.
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'Text',
                        text: 'Use the ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'source',
                        data: {
                            label: 'source',
                            target: 'parrots.txt_',
                            isAnonymous: true,
                            isEmbeded: true,
                        },
                    },
                    {
                        type: 'Text',
                        text: '.',
                    },
                ],
            },
        ])

        testGenerator(input, `
            <p>
                Use the <a href="parrots.txt_">source</a>.
            </p>
        `, `
            Use the [source](parrots.txt_).
        `)
    })

    describe('when HyperlinkRef label contains angle-bracketed text that is not a url, at least one bracket must be escaped', () => {
        const input = `
            See \`HTML Element: \\<a>\`_ and \`HTML Element: <b\\>\`_

            .. _HTML Element: \\<a>:
            .. _HTML Element: <b\\>: https://google.ca
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'Text',
                        text: 'See ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'HTML Element: <a>',
                        data: {
                            isAlias: true,
                        },
                    },
                    {
                        type: 'Text',
                        text: ' and ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'HTML Element: <b>',
                        data: {
                            isAlias: true,
                        },
                    },
                ],
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'HTML Element: <a>',
                    target: '',
                    isTargetingNextNode: true,
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'HTML Element: <b>',
                    target: 'https://google.ca',
                },
            },
        ])

        testGenerator(input, `
            <p>
                See <a href="https://google.ca">HTML Element: &lt;a&gt;</a> and <a href="https://google.ca">HTML Element: &lt;b&gt;</a>
            </p>

            <!-- HyperlinkTarget id:6 children:0 label:"HTML Element: <a>" target:"" isTargetingNextNode:true resolvedUrl:"https://google.ca" -->

            <!-- HyperlinkTarget id:7 children:0 label:"HTML Element: <b>" target:"https://google.ca" resolvedUrl:"https://google.ca" -->
        `, `
            See [HTML Element: &lt;a&gt;](https://google.ca) and [HTML Element: &lt;b&gt;](https://google.ca)

            [HyperlinkTarget id:6 children:0 label:"HTML Element: <a>" target:"" isTargetingNextNode:true resolvedUrl:"https://google.ca"]: #

            [HyperlinkTarget id:7 children:0 label:"HTML Element: <b>" target:"https://google.ca" resolvedUrl:"https://google.ca"]: #
        `)
    })

    describe('when HyperlinkRef label contains angle-bracketed text that is not a url, the bracket must be followed by escaped space', () => {
        const input = `
            See \`HTML Element: <c>\\ \`_

            .. _HTML Element: <c>\\ : https://google.ca
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'Text',
                        text: 'See ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'HTML Element: <c>',
                        data: {
                            isAlias: true,
                        },
                    },
                ],
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'HTML Element: <c>',
                    target: 'https://google.ca',
                },
            },
        ])

        testGenerator(input, `
            <p>
                See <a href="https://google.ca">HTML Element: &lt;c&gt;</a>
            </p>

            <!-- HyperlinkTarget id:4 children:0 label:"HTML Element: <c>" target:"https://google.ca" resolvedUrl:"https://google.ca" -->
        `, `
            See [HTML Element: &lt;c&gt;](https://google.ca)

            [HyperlinkTarget id:4 children:0 label:"HTML Element: <c>" target:"https://google.ca" resolvedUrl:"https://google.ca"]: #
        `)
    })

    describe('when HyperlinkRef with embeded target does not have label, it uses embeded url for label', () => {
        const input = `
            See \`<a_named_relative_link>\`_ or \`<an_anonymous_relative_link>\`__ for details.
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'Text',
                        text: 'See ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'a_named_relative_link',
                        data: {
                            isEmbeded: true,
                        },
                    },
                    {
                        type: 'Text',
                        text: ' or ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'an_anonymous_relative_link',
                        data: {
                            isEmbeded: true,
                            isAnonymous: true,
                        },
                    },
                    {
                        type: 'Text',
                        text: ' for details.',
                    },
                ],
            },
        ])
    })

    describe('when there are more HyperlinkRefs than HyperlinkTargets but sufficient anonymous Target/Ref matches, it resolves without error', () => {
        const input = `
            https://google.ca

            See more on GitHub__

            __ https://trinovantes.github.io/rst-compiler/
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'HyperlinkRef',
                        text: 'https://google.ca',
                    },
                ],
            },
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'Text',
                        text: 'See more on ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'GitHub',
                        data: {
                            isAnonymous: true,
                            isAlias: true,
                        },
                    },
                ],
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    isAnonymous: true,
                    label: '_',
                    target: 'https://trinovantes.github.io/rst-compiler/',
                },
            },
        ])

        testGenerator(input, `
            <p>
                <a href="https://google.ca">https://google.ca</a>
            </p>

            <p>
                See more on <a href="https://trinovantes.github.io/rst-compiler/">GitHub</a>
            </p>

            <!-- HyperlinkTarget id:6 children:0 label:"_" target:"https://trinovantes.github.io/rst-compiler/" isAnonymous:true resolvedUrl:"https://trinovantes.github.io/rst-compiler/" -->
        `, `
            [https://google.ca](https://google.ca)

            See more on [GitHub](https://trinovantes.github.io/rst-compiler/)

            [HyperlinkTarget id:6 children:0 label:"_" target:"https://trinovantes.github.io/rst-compiler/" isAnonymous:true resolvedUrl:"https://trinovantes.github.io/rst-compiler/"]: #
        `)
    })

    test('when HyperlinkRef with embeded target reference an embeded link in another HyperlinkRef, they should both resolve to same url', () => {
        const label = 'Python home page'
        const url = 'https://www.python.org'
        const input = `
            See the \`${label} <${url}>\`_ for info.

            This \`link <${label}_>\`_ is an alias to the link above.
        `

        const generatorState = parseTestInputForGeneratorState(input)
        expect(generatorState.resolveSimpleNameToUrl(normalizeSimpleName('Python home page'))).toBe(url)
        expect(generatorState.resolveSimpleNameToUrl(normalizeSimpleName('link'))).toBe(url)
    })

    test('when anonymous HyperlinkRef without embeded target does not have matching anonymous HyperlinkTarget, it throws error', () => {
        const input = `
            hello \`world\`__

            .. _world: https://this-hyperlinktarget-should-not-be-targeted.com
        `

        const generate = () => {
            const opts = { disableWarnings: true, disableErrors: true }
            return new RstToHtmlCompiler().compile(input, opts, opts)
        }

        expect(() => generate()).toThrow(/Failed to resolve/)
    })

    describe('when HyperlinkRef has angled brackets as part of its label, it prioritizes HyperlinkTarget with angle brackets', () => {
        const goodUrl = 'https://google.ca'
        const badUrl = 'https://bing.ca'
        const input = `
            \`Foo<Bar>\`_

            .. _Foo: ${badUrl}
            .. _Foo<Bar>: ${goodUrl}
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'HyperlinkRef',
                        text: 'Foo',
                        data: {
                            label: 'Foo',
                            target: 'Bar',
                            isEmbeded: true,
                        },
                    },
                ],
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'Foo',
                    target: badUrl,
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: 'Foo<Bar>',
                    target: goodUrl,
                },
            },
        ])

        testGenerator(input, `
            <p>
                <a href="${goodUrl}">Foo</a>
            </p>

            <!-- HyperlinkTarget id:3 children:0 label:"Foo" target:"${badUrl}" resolvedUrl:"${badUrl}" -->

            <!-- HyperlinkTarget id:4 children:0 label:"Foo<Bar>" target:"${goodUrl}" resolvedUrl:"${goodUrl}" -->
        `, `
            [Foo](${goodUrl})

            [HyperlinkTarget id:3 children:0 label:"Foo" target:"${badUrl}" resolvedUrl:"${badUrl}"]: #

            [HyperlinkTarget id:4 children:0 label:"Foo<Bar>" target:"${goodUrl}" resolvedUrl:"${goodUrl}"]: #
        `)
    })

    describe('when HyperlinkRef seems to be alias but target resolves to an existing local SimpleName, it prioritizes the local SimpleName', () => {
        const input = `
            See \`if/else/elif\`_

            if/else/elif
            ^^^^^^^^^^^^
        `

        testParser(input, [
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'Text',
                        text: 'See ',
                    },
                    {
                        type: 'HyperlinkRef',
                        text: 'if/else/elif',
                    },
                ],
            },
            {
                type: 'Section',
                text: 'if/else/elif',
                data: {
                    level: 1,
                },
            },
        ])

        testGenerator(input, `
            <p>
                See <a href="#if-else-elif">if/else/elif</a>
            </p>

            <h1 id="if-else-elif">
                if/else/elif
            </h1>
        `, `
            See [if/else/elif](#if-else-elif)

            # if/else/elif {#if-else-elif}
        `)
    })

    describe('when HyperlinkTarget has labels with similar text but different allowed symbols, it parses them as separate SimpleNames', () => {
        const input = `
            .. _"code": directives.html#code

            .. _\`:code:\`: roles.html#code
        `

        testParser(input, [
            {
                type: 'HyperlinkTarget',
                data: {
                    label: '"code"',
                    target: 'directives.html#code',
                },
            },
            {
                type: 'HyperlinkTarget',
                data: {
                    label: ':code:',
                    target: 'roles.html#code',
                },
            },
        ])

        testGenerator(input, `
            <!-- HyperlinkTarget id:1 children:0 label:""code"" target:"directives.html#code" resolvedUrl:"directives.html#code" -->

            <!-- HyperlinkTarget id:2 children:0 label:":code:" target:"roles.html#code" resolvedUrl:"roles.html#code" -->
        `, `
            [HyperlinkTarget id:1 children:0 label:""code"" target:"directives.html#code" resolvedUrl:"directives.html#code"]: #

            [HyperlinkTarget id:2 children:0 label:":code:" target:"roles.html#code" resolvedUrl:"roles.html#code"]: #
        `)
    })
})
