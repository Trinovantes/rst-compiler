import { test, describe, expect } from 'vitest'
import { RstNodeSource } from '@/RstNode/RstNode.js'
import { RstFootnoteDef } from '@/RstNode/ExplicitMarkup/FootnoteDef.js'
import { RstFootnoteRef } from '@/RstNode/Inline/FootnoteRef.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { parseTestInput } from 'tests/fixtures/parseTestInput.js'
import { RstToHtmlCompiler } from '@/RstCompiler.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'

describe('manual number', () => {
    const input = `
        Hello [1]_ World

        .. [1] footnote
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
                    type: RstNodeType.FootnoteRef,
                    text: '1',
                    data: {
                        isManualLabelNum: true,
                        isAutoSymbol: false,
                    },
                },
                {
                    type: RstNodeType.Text,
                    text: ' World',
                },
            ],
        },
        {
            type: RstNodeType.FootnoteDefGroup,
            children: [
                {
                    type: RstNodeType.FootnoteDef,
                    text: 'footnote',
                    data: {
                        label: '1',
                        isManualLabelNum: true,
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            Hello <a href="#footnotedef-1" id="footnoteref-1" class="footnote-reference">1</a> World
        </p>

        <dl class="footnotes">
            <dt id="footnotedef-1">
                <span class="footnote-definition">
                    1
                    <span class="backlinks">
                        <a href="#footnoteref-1">[1]</a>
                    </span>
                </span>
            </dt>
            <dd>
                <p>
                    footnote
                </p>
            </dd>
        </dl>
    `, `
        Hello [^1] World

        [^1]:
            footnote
    `)
})

describe('auto number', () => {
    const input = `
        [#]_ auto number

        [#note]_ auto number with label

        .. [#] footnote
        .. [#note] this auto label can be reused
    `

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.FootnoteRef,
                    text: '#',
                    data: {
                        isManualLabelNum: false,
                        isAutoSymbol: false,
                    },
                },
                {
                    type: RstNodeType.Text,
                    text: ' auto number',
                },
            ],
        },
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.FootnoteRef,
                    text: '#note',
                    data: {
                        isManualLabelNum: false,
                        isAutoSymbol: false,
                    },
                },
                {
                    type: RstNodeType.Text,
                    text: ' auto number with label',
                },
            ],
        },
        {
            type: RstNodeType.FootnoteDefGroup,
            children: [
                {
                    type: RstNodeType.FootnoteDef,
                    text: 'footnote',
                    data: {
                        label: '#',
                    },
                },
                {
                    type: RstNodeType.FootnoteDef,
                    text: 'this auto label can be reused',
                    data: {
                        label: '#note',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            <a href="#footnotedef-1" id="footnoteref-1" class="footnote-reference">1</a> auto number
        </p>

        <p>
            <a href="#note" id="footnoteref-2" class="footnote-reference">2</a> auto number with label
        </p>

        <dl class="footnotes">
            <dt id="footnotedef-1">
                <span class="footnote-definition">
                    1
                    <span class="backlinks">
                        <a href="#footnoteref-1">[1]</a>
                    </span>
                </span>
            </dt>
            <dd>
                <p>
                    footnote
                </p>
            </dd>

            <dt id="note">
                <span class="footnote-definition">
                    2
                    <span class="backlinks">
                        <a href="#footnoteref-2">[1]</a>
                    </span>
                </span>
            </dt>
            <dd>
                <p>
                    this auto label can be reused
                </p>
            </dd>
        </dl>
    `, `
        [^1] auto number

        [^2] auto number with label

        [^1]:
            footnote

        [^2]:
            this auto label can be reused
    `)
})

describe('auto symbol', () => {
    const input = `
        Hello [*]_ World

        .. [*] footnote
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
                    type: RstNodeType.FootnoteRef,
                    text: '*',
                    data: {
                        isManualLabelNum: false,
                        isAutoSymbol: true,
                    },
                },
                {
                    type: RstNodeType.Text,
                    text: ' World',
                },
            ],
        },
        {
            type: RstNodeType.FootnoteDefGroup,
            children: [
                {
                    type: RstNodeType.FootnoteDef,
                    text: 'footnote',
                    data: {
                        label: '*',
                        isAutoSymbol: true,
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <p>
            Hello <a href="#footnotedef-1" id="footnoteref-1" class="footnote-reference">*</a> World
        </p>

        <dl class="footnotes">
            <dt id="footnotedef-1">
                <span class="footnote-definition">
                    *
                    <span class="backlinks">
                        <a href="#footnoteref-1">[1]</a>
                    </span>
                </span>
            </dt>
            <dd>
                <p>
                    footnote
                </p>
            </dd>
        </dl>
    `, `
        Hello [^*] World

        [^*]:
            footnote
    `)
})

describe('FootnoteDef.isTargetedByFootnoteRef', () => {
    const registrar = new RstNodeRegistrar()
    const source: RstNodeSource = {
        startLineIdx: 0xDEADBEEF,
        endLineIdx: 0xDEADBEEF,
    }

    describe('when FootnoteDef is manual number, it will only match exact FootnoteRef number', () => {
        const def = new RstFootnoteDef(registrar, source, [], '1')

        test('when FootnoteRef number match, it returns true', () => {
            const ref = new RstFootnoteRef(registrar, source, '1')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(true)
        })

        test('when FootnoteRef number do not match, it returns false', () => {
            const ref = new RstFootnoteRef(registrar, source, '2')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(false)
        })

        test('when FootnoteRef is not manual number, it returns false', () => {
            const ref = new RstFootnoteRef(registrar, source, '#')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(false)
        })
    })

    describe('when FootnoteDef is auto number, it will match any FootnoteRef auto number', () => {
        const def = new RstFootnoteDef(registrar, source, [], '#')

        test('when FootnoteRef is auto number without label, it returns true', () => {
            const ref = new RstFootnoteRef(registrar, source, '#')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(true)
        })

        test('when FootnoteRef is auto number with label, it returns true', () => {
            const ref = new RstFootnoteRef(registrar, source, '#label')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(true)
        })
    })

    describe('when FootnoteDef is auto number with label, it will only match any FootnoteRef with auto number with label', () => {
        const def = new RstFootnoteDef(registrar, source, [], '#label')

        test('when FootnoteRef is auto number without label, it returns false', () => {
            const ref = new RstFootnoteRef(registrar, source, '#')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(false)
        })

        test('when FootnoteRef is auto number with exact label, it returns true', () => {
            const ref = new RstFootnoteRef(registrar, source, '#label')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(true)
        })

        test('when FootnoteRef is auto number with different label, it returns false', () => {
            const ref = new RstFootnoteRef(registrar, source, '#label2')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(false)
        })
    })

    describe('when FootnoteDef is auto symbol, it will only match exact FootnoteRef with auto symbol', () => {
        const def = new RstFootnoteDef(registrar, source, [], '*')

        test('when FootnoteRef is auto symbol, it returns true', () => {
            const ref = new RstFootnoteRef(registrar, source, '*')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(true)
        })

        test('when FootnoteRef is not auto symbol, it returns false', () => {
            const ref = new RstFootnoteRef(registrar, source, '1')
            expect(def.isTargetedByFootnoteRef(ref)).toBe(false)
        })
    })
})

// ----------------------------------------------------------------------------
// MARK: RstResolverSimpleName
// ----------------------------------------------------------------------------

describe('RstResolverSimpleName', () => {
    test('when FootnoteRef has reference to non-existent FootnoteDef, it throws error', () => {
        const input = `
            [1]_
        `

        const generate = () => {
            const opts = { disableWarnings: true, disableErrors: true }
            return new RstToHtmlCompiler().compile(input, opts, opts)
        }

        expect(() => generate()).toThrow(/Failed to resolveFootnoteRefToDef/)
    })

    describe('getSimpleName(FootnoteDef)', () => {
        test('when FootnoteDef is manual number, it returns the labelNum', () => {
            const input = `
                text

                .. [99] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const footnoteDef = root.findAllChildren(RstNodeType.FootnoteDef)[0]
            const simpleName = simpleNameResolver.getSimpleName(footnoteDef)
            expect(simpleName).toBe('footnotedef-99')
        })

        test('when FootnoteDef is auto number, it returns the labelNum', () => {
            const input = `
                text

                .. [#] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const footnoteDef = root.findAllChildren(RstNodeType.FootnoteDef)[0]
            const simpleName = simpleNameResolver.getSimpleName(footnoteDef)
            expect(simpleName).toBe('footnotedef-1')
        })

        test('when FootnoteDef is auto number with label, it returns the label', () => {
            const input = `
                text

                .. [#label] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const footnoteDef = root.findAllChildren(RstNodeType.FootnoteDef)[0]
            const simpleName = simpleNameResolver.getSimpleName(footnoteDef)
            expect(simpleName).toBe('label')
        })

        test('when FootnoteDef is auto symbol, it returns the labelNum', () => {
            const input = `
                text

                .. [*] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const footnoteDef = root.findAllChildren(RstNodeType.FootnoteDef)[0]
            const simpleName = simpleNameResolver.getSimpleName(footnoteDef)
            expect(simpleName).toBe('footnotedef-1')
        })
    })

    describe('resolveFootnoteRefLabel', () => {
        test('when FootnoteRef is manual number, it returns the labelNum', () => {
            const input = `
                [1]_

                .. [1] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const ref = root.findAllChildren(RstNodeType.FootnoteRef)[0]
            expect(simpleNameResolver.resolveFootnoteRefLabel(ref)).toBe('1')
        })

        test('when FootnoteRef is auto number, it returns the labelNum', () => {
            const input = `
                [#]_

                .. [#] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const ref = root.findAllChildren(RstNodeType.FootnoteRef)[0]
            expect(simpleNameResolver.resolveFootnoteRefLabel(ref)).toBe('1')
        })

        test('when FootnoteRef is auto number with label, it returns the labelNum', () => {
            const input = `
                [#label]_

                .. [#] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const ref = root.findAllChildren(RstNodeType.FootnoteRef)[0]
            expect(simpleNameResolver.resolveFootnoteRefLabel(ref)).toBe('1')
        })

        test('when FootnoteRef is auto symbol, it returns the symbol', () => {
            const input = `
                [*]_

                .. [*] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const ref = root.findAllChildren(RstNodeType.FootnoteRef)[0]
            expect(simpleNameResolver.resolveFootnoteRefLabel(ref)).toBe('*')
        })
    })

    describe('resolveFootnoteDefLabel', () => {
        test('when FootnoteDef is manual number, it returns the labelNum', () => {
            const input = `
                .. [1] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const def = root.findAllChildren(RstNodeType.FootnoteDef)[0]
            expect(simpleNameResolver.resolveFootnoteDefLabel(def)).toBe('1')
        })

        test('when FootnoteDef is auto number, it returns the labelNum', () => {
            const input = `
                .. [#] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const def = root.findAllChildren(RstNodeType.FootnoteDef)[0]
            expect(simpleNameResolver.resolveFootnoteDefLabel(def)).toBe('1')
        })

        test('when FootnoteDef is auto number with label, it returns the labelNum', () => {
            const input = `
                .. [#label] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const def = root.findAllChildren(RstNodeType.FootnoteDef)[0]
            expect(simpleNameResolver.resolveFootnoteDefLabel(def)).toBe('1')
        })

        test('when FootnoteDef is auto symbol, it returns the symbol', () => {
            const input = `
                .. [*] footnote
            `

            const { root, simpleNameResolver } = parseTestInput(input)
            const def = root.findAllChildren(RstNodeType.FootnoteDef)[0]
            expect(simpleNameResolver.resolveFootnoteDefLabel(def)).toBe('*')
        })
    })

    describe('FootnoteRefs with auto label can be referenced by both FootnoteRef and HyperlinkRef', () => {
        const input = `
            If [#note]_ is the first footnote reference, it will show up as
            "[1]".  We can refer to it again as [#note]_ and again see
            "[1]".  We can also refer to it as \`note\`_ (an ordinary internal
            hyperlink reference).

            .. [#note] This is the footnote labeled "note".
        `

        const { root, simpleNameResolver } = parseTestInput(input)

        const defs = root.findAllChildren(RstNodeType.FootnoteDef)
        const refs = root.findAllChildren(RstNodeType.FootnoteRef)
        const hyperlinkRefs = root.findAllChildren(RstNodeType.HyperlinkRef)

        test('Document has 1 FootnoteDef and 2 FootnoteRefs', () => {
            expect(defs.length).toBe(1)
            expect(refs.length).toBe(2)
            expect(hyperlinkRefs.length).toBe(1)
        })

        test('both FootnoteRefs link to same FootnoteDef', () => {
            expect(simpleNameResolver.resolveFootnoteRefToDef(refs[0])?.label).toBe('#note')
            expect(simpleNameResolver.resolveFootnoteRefToDef(refs[1])?.label).toBe('#note')
        })

        test('HyperlinkRef `note`_ resolves to same FootnoteDef', () => {
            const ref = hyperlinkRefs[0]
            const refSimpleName = simpleNameResolver.getSimpleName(ref)
            expect(simpleNameResolver.resolveSimpleNameToUrl(refSimpleName)).toBe('#note')
        })

        test('FootnoteDef backlinks back to both FootnoteRefs', () => {
            expect(simpleNameResolver.getFootnoteDefBacklinks(defs[0])).toStrictEqual([
                simpleNameResolver.getSimpleName(refs[0]),
                simpleNameResolver.getSimpleName(refs[1]),
            ])
        })

        testGenerator(input, `
            <p>
                If <a href="#note" id="footnoteref-1" class="footnote-reference">1</a> is the first footnote reference, it will show up as
                &quot;[1]&quot;.  We can refer to it again as <a href="#note" id="footnoteref-2" class="footnote-reference">1</a> and again see
                &quot;[1]&quot;.  We can also refer to it as <a href="#note">note</a> (an ordinary internal
                hyperlink reference).
            </p>

            <dl class="footnotes">
                <dt id="note">
                    <span class="footnote-definition">
                        1
                        <span class="backlinks">
                            <a href="#footnoteref-1">[1]</a>
                            <a href="#footnoteref-2">[2]</a>
                        </span>
                    </span>
                </dt>
                <dd>
                    <p>
                        This is the footnote labeled &quot;note&quot;.
                    </p>
                </dd>
            </dl>
        `, `
            If [^1] is the first footnote reference, it will show up as
            &quot;[1]&quot;.  We can refer to it again as [^1] and again see
            &quot;[1]&quot;.  We can also refer to it as [note](#note) (an ordinary internal
            hyperlink reference).
            
            [^1]:
                This is the footnote labeled &quot;note&quot;.
        `)
    })

    describe('auto number FootnoteRefs and FootnoteDefs do not need to be in alternate lockstep', () => {
        const input = `
            [#]_ is a reference to footnote 1, and [#]_ is a reference to
            footnote 2.

            .. [#] This is footnote 1.
            .. [#] This is footnote 2.
            .. [#] This is footnote 3.

            [#]_ is a reference to footnote 3.
        `

        test('resolveFootnoteRefLabel(FootnoteRef) resolves correctly', () => {
            const { root, simpleNameResolver } = parseTestInput(input)
            const defs = root.findAllChildren(RstNodeType.FootnoteDef)
            const refs = root.findAllChildren(RstNodeType.FootnoteRef)

            expect(defs.length).toBe(3)
            expect(refs.length).toBe(3)

            expect(defs[0].toString()).toContain('This is footnote 1.')
            expect(defs[1].toString()).toContain('This is footnote 2.')
            expect(defs[2].toString()).toContain('This is footnote 3.')

            expect(simpleNameResolver.resolveFootnoteRefLabel(refs[0])).toBe('1')
            expect(simpleNameResolver.resolveFootnoteRefLabel(refs[1])).toBe('2')
            expect(simpleNameResolver.resolveFootnoteRefLabel(refs[2])).toBe('3')
        })

        testGenerator(input, `
            <p>
                <a href="#footnotedef-1" id="footnoteref-1" class="footnote-reference">1</a> is a reference to footnote 1, and <a href="#footnotedef-2" id="footnoteref-2" class="footnote-reference">2</a> is a reference to
                footnote 2.
            </p>

            <dl class="footnotes">
                <dt id="footnotedef-1">
                    <span class="footnote-definition">
                        1
                        <span class="backlinks">
                            <a href="#footnoteref-1">[1]</a>
                        </span>
                    </span>
                </dt>
                <dd>
                    <p>
                        This is footnote 1.
                    </p>
                </dd>

                <dt id="footnotedef-2">
                    <span class="footnote-definition">
                        2
                        <span class="backlinks">
                            <a href="#footnoteref-2">[1]</a>
                        </span>
                    </span>
                </dt>
                <dd>
                    <p>
                        This is footnote 2.
                    </p>
                </dd>

                <dt id="footnotedef-3">
                    <span class="footnote-definition">
                        3
                        <span class="backlinks">
                            <a href="#footnoteref-3">[1]</a>
                        </span>
                    </span>
                </dt>
                <dd>
                    <p>
                        This is footnote 3.
                    </p>
                </dd>
            </dl>

            <p>
                <a href="#footnotedef-3" id="footnoteref-3" class="footnote-reference">3</a> is a reference to footnote 3.
            </p>
        `, `
            [^1] is a reference to footnote 1, and [^2] is a reference to
            footnote 2.

            [^1]:
                This is footnote 1.

            [^2]:
                This is footnote 2.

            [^3]:
                This is footnote 3.

            [^3] is a reference to footnote 3.
        `)
    })

    describe('manual numbering takes priority over auto numbered footnotes', () => {
        const input = `
            [2]_ will be "2" (manually numbered),
            [#]_ will be "3" (anonymous auto-numbered), and
            [#label]_ will be "1" (labeled auto-numbered).

            .. [2] This footnote is labeled manually, so its number is fixed.

            .. [#label] This autonumber-labeled footnote will be labeled "1".
               It is the first auto-numbered footnote and no other footnote
               with label "1" exists.  The order of the footnotes is used to
               determine numbering, not the order of the footnote references.

            .. [#] This footnote will be labeled "3".  It is the second
               auto-numbered footnote, but footnote label "2" is already used.
        `

        test('resolveFootnoteRefLabel(FootnoteRef) resolves correctly', () => {
            const { root, simpleNameResolver } = parseTestInput(input)
            const defs = root.findAllChildren(RstNodeType.FootnoteDef)
            const refs = root.findAllChildren(RstNodeType.FootnoteRef)

            expect(defs.length).toBe(3)
            expect(refs.length).toBe(3)

            expect(defs[0].toString()).toContain('This footnote is labeled manually, so its number is fixed.')
            expect(defs[1].toString()).toContain('This autonumber-labeled footnote will be labeled "1"')
            expect(defs[2].toString()).toContain('This footnote will be labeled "3"')

            expect(simpleNameResolver.resolveFootnoteDefLabel(defs[0])).toBe('2')
            expect(simpleNameResolver.resolveFootnoteDefLabel(defs[1])).toBe('1')
            expect(simpleNameResolver.resolveFootnoteDefLabel(defs[2])).toBe('3')

            expect(simpleNameResolver.resolveFootnoteRefLabel(refs[0])).toBe('2')
            expect(simpleNameResolver.resolveFootnoteRefLabel(refs[1])).toBe('3')
            expect(simpleNameResolver.resolveFootnoteRefLabel(refs[2])).toBe('1')
        })

        testGenerator(input, `
            <p>
                <a href="#footnotedef-2" id="footnoteref-1" class="footnote-reference">2</a> will be &quot;2&quot; (manually numbered),
                <a href="#footnotedef-3" id="footnoteref-2" class="footnote-reference">3</a> will be &quot;3&quot; (anonymous auto-numbered), and
                <a href="#label" id="footnoteref-3" class="footnote-reference">1</a> will be &quot;1&quot; (labeled auto-numbered).
            </p>

            <dl class="footnotes">
                <dt id="footnotedef-2">
                    <span class="footnote-definition">
                        2
                        <span class="backlinks">
                            <a href="#footnoteref-1">[1]</a>
                        </span>
                    </span>
                </dt>
                <dd>
                    <p>
                        This footnote is labeled manually, so its number is fixed.
                    </p>
                </dd>

                <dt id="label">
                    <span class="footnote-definition">
                        1
                        <span class="backlinks">
                            <a href="#footnoteref-3">[1]</a>
                        </span>
                    </span>
                </dt>
                <dd>
                    <p>
                        This autonumber-labeled footnote will be labeled &quot;1&quot;.
                        It is the first auto-numbered footnote and no other footnote
                        with label &quot;1&quot; exists.  The order of the footnotes is used to
                        determine numbering, not the order of the footnote references.
                    </p>
                </dd>

                <dt id="footnotedef-3">
                    <span class="footnote-definition">
                        3
                        <span class="backlinks">
                            <a href="#footnoteref-2">[1]</a>
                        </span>
                    </span>
                </dt>
                <dd>
                    <p>
                        This footnote will be labeled &quot;3&quot;.  It is the second
                        auto-numbered footnote, but footnote label &quot;2&quot; is already used.
                    </p>
                </dd>
            </dl>
        `, `
            [^2] will be &quot;2&quot; (manually numbered),
            [^3] will be &quot;3&quot; (anonymous auto-numbered), and
            [^1] will be &quot;1&quot; (labeled auto-numbered).

            [^2]:
                This footnote is labeled manually, so its number is fixed.

            [^1]:
                This autonumber-labeled footnote will be labeled &quot;1&quot;.
                It is the first auto-numbered footnote and no other footnote
                with label &quot;1&quot; exists.  The order of the footnotes is used to
                determine numbering, not the order of the footnote references.

            [^3]:
                This footnote will be labeled &quot;3&quot;.  It is the second
                auto-numbered footnote, but footnote label &quot;2&quot; is already used.
        `)
    })
})
