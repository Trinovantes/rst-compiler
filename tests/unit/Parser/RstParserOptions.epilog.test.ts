import { RstToHtmlCompiler } from '@/RstCompiler.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { trimCommonIndent } from '@/utils/trimCommonIndent.js'
import { describe, expect, test } from 'vitest'

test('when there is no epilog, it throws error', () => {
    const input = `
        The |biohazard| symbol must be used on containers used to
        dispose of medical waste.
    `

    const generate = () => {
        const opts = { disableWarnings: true, disableErrors: true }
        return new RstToHtmlCompiler().compile(input, opts, opts)
    }

    expect(() => generate()).toThrow(/Failed to resolveSubstitution/)
})

describe('when there is epilog, it appends to end of input', () => {
    const input = `
        The |biohazard| symbol must be used on containers used to
        dispose of medical waste.
    `

    const epilog = trimCommonIndent(`
        .. |biohazard| image:: biohazard.png
           :height: 99
           :width: 99
    `)

    testParser(input, [
        {
            type: RstNodeType.Paragraph,
            children: [
                {
                    type: RstNodeType.Text,
                    text: 'The ',
                },
                {
                    type: RstNodeType.SubstitutionRef,
                    text: 'biohazard',
                },
                {
                    type: RstNodeType.Text,
                    text: ' symbol must be used on containers used to\ndispose of medical waste.',
                },
            ],
        },
        {
            type: RstNodeType.SubstitutionDef,
            data: {
                directive: 'image',
                needle: 'biohazard',
                initContent: [
                    {
                        type: RstNodeType.Paragraph,
                        text: 'biohazard.png',
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
                                        text: 'height',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: '99',
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
                                        text: 'width',
                                    },
                                ],
                                body: [
                                    {
                                        type: RstNodeType.Paragraph,
                                        text: '99',
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
        },
    ], {
        epilog: trimCommonIndent(epilog),
    })

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
    `, {
        parserOptions: {
            epilog: trimCommonIndent(epilog),
        },
    })
})
