import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { testGenerator } from 'tests/fixtures/testGenerator.js'

describe('next visible node gets html class', () => {
    const input = `
        .. class:: special

        .. invisible

        .. |biohazard| image:: biohazard.png

        Hello World
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'class',
                isInvisibleContent: true,
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'special',
                    },
                ],
            },
        },
        {
            type: 'Comment',
            text: 'invisible',
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
            },
        },
        {
            type: 'Paragraph',
            text: 'Hello World',
        },
    ])

    testGenerator(input, `
        <!-- Directive id:3 children:0 directive:"class" initContentText:"special" isInvisibleContent:true -->

        <!-- invisible -->

        <!-- SubstitutionDef id:7 children:0 needle:"biohazard" directive:"image" initContentText:"biohazard.png" -->

        <p class="special">
            Hello World
        </p>
    `, `
        [Directive id:3 children:0 directive:"class" initContentText:"special" isInvisibleContent:true]: #

        [invisible]: #

        [SubstitutionDef id:7 children:0 needle:"biohazard" directive:"image" initContentText:"biohazard.png"]: #

        <p class="special">
            Hello World
        </p>
    `)
})

describe('when Directive is last child inside another block, next visible node outside gets html class', () => {
    const input = `
        * item 1

          .. class:: special

        * item 2
    `

    testParser(input, [
        {
            type: 'BulletList',
            children: [
                {
                    type: 'BulletListItem',
                    data: {
                        bullet: '*',
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'item 1',
                        },
                        {
                            type: 'Directive',
                            data: {
                                directive: 'class',
                                isInvisibleContent: true,
                                initContent: [
                                    {
                                        type: 'Paragraph',
                                        text: 'special',
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    type: 'BulletListItem',
                    text: 'item 2',
                    data: {
                        bullet: '*',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <ul>
            <li>
                <p>
                    item 1
                </p>
                <!-- Directive id:5 children:0 directive:"class" initContentText:"special" isInvisibleContent:true -->
            </li>
            <li class="special">
                <p>
                    item 2
                </p>
            </li>
        </ul>
    `, `
        <ul>
            <li>
                <p>
                    item 1
                </p>
                <!-- Directive id:5 children:0 directive:"class" initContentText:"special" isInvisibleContent:true -->
            </li>
            <li class="special">
                <p>
                    item 2
                </p>
            </li>
        </ul>
    `)
})

describe('when next node is Blockquote, the Directive must be followed by empty comment', () => {
    const input = `
        .. class:: special
        ..

            blockquote
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'class',
                isInvisibleContent: true,
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'special',
                    },
                ],
            },
        },
        {
            type: 'Blockquote',
            text: 'blockquote',
        },
    ])

    testGenerator(input, `
        <!-- Directive id:3 children:0 directive:"class" initContentText:"special" isInvisibleContent:true -->

        <blockquote class="special">
            <p>
                blockquote
            </p>
        </blockquote>
    `, `
        [Directive id:3 children:0 directive:"class" initContentText:"special" isInvisibleContent:true]: #

        <blockquote class="special">
            <p>
                blockquote
            </p>
        </blockquote>
    `)
})

describe('when Directive has nested blocks, all children get html class', () => {
    const input = `
        .. class:: special

            Hello

            .. class:: another-special

            World
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'class',
                isInvisibleContent: true,
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'special',
                    },
                ],
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'Hello',
                },
                {
                    type: 'Directive',
                    data: {
                        directive: 'class',
                        isInvisibleContent: true,
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'another-special',
                            },
                        ],
                    },
                },
                {
                    type: 'Paragraph',
                    text: 'World',
                },
            ],
        },
    ])

    testGenerator(input, `
        <!-- Directive id:10 children:3 directive:"class" initContentText:"special" isInvisibleContent:true -->

        <p class="special">
            Hello
        </p>
        <!-- Directive id:7 children:0 directive:"class" initContentText:"another-special" isInvisibleContent:true -->
        <p class="another-special special">
            World
        </p>
    `, `
        <!-- Directive id:10 children:3 directive:"class" initContentText:"special" isInvisibleContent:true -->

        <p class="special">
            Hello
        </p>
        <!-- Directive id:7 children:0 directive:"class" initContentText:"another-special" isInvisibleContent:true -->
        <p class="another-special special">
            World
        </p>
    `)
})

describe('when next node is LiteralBlock with predefined class, it combines html classes', () => {
    const input = `
        .. rst-class:: code-example-bad

        ::

            enum Tiles {TILE_BRICK, TILE_FLOOR, TILE_SPIKE, TILE_TELEPORT,}
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'rst-class',
                isInvisibleContent: true,
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'code-example-bad',
                    },
                ],
            },
        },
        {
            type: 'Paragraph',
            text: '::',
        },
        {
            type: 'LiteralBlock',
            text: 'enum Tiles {TILE_BRICK, TILE_FLOOR, TILE_SPIKE, TILE_TELEPORT,}',
        },
    ])

    testGenerator(input, `
        <!-- Directive id:3 children:0 directive:"rst-class" initContentText:"code-example-bad" isInvisibleContent:true -->

        <!-- :: -->

        <div class="literal-block code-example-bad">
            <pre class="code code-example-bad">enum Tiles {TILE_BRICK, TILE_FLOOR, TILE_SPIKE, TILE_TELEPORT,}</pre>
        </div>
    `, `
        [Directive id:3 children:0 directive:"rst-class" initContentText:"code-example-bad" isInvisibleContent:true]: #

        [::]: #

        <div class="literal-block code-example-bad">
            <pre class="code code-example-bad">enum Tiles {TILE_BRICK, TILE_FLOOR, TILE_SPIKE, TILE_TELEPORT,}</pre>
        </div>
    `)
})

describe('when next node is CitationDef with predefined class, it combines html classes', () => {
    const input = `
        .. rst-class:: special

        .. [label] citation
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'rst-class',
                isInvisibleContent: true,
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'special',
                    },
                ],
            },
        },
        {
            type: 'CitationDefGroup',
            children: [
                {
                    type: 'CitationDef',
                    text: 'citation',
                    data: {
                        label: 'label',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <!-- Directive id:3 children:0 directive:"rst-class" initContentText:"special" isInvisibleContent:true -->

        <dl class="citations special">
            <dt id="label">
                <span class="citation-definition">
                    label
                </span>
            </dt>
            <dd>
                <p>
                    citation
                </p>
            </dd>
        </dl>
    `, `
        [Directive id:3 children:0 directive:"rst-class" initContentText:"special" isInvisibleContent:true]: #

        <dl class="citations special">
            <dt id="label">
                <span class="citation-definition">
                    label
                </span>
            </dt>
            <dd>
                <p>
                    citation
                </p>
            </dd>
        </dl>
    `)
})

describe('when next node is FootnoteDef with predefined class, it combines html classes', () => {
    const input = `
        .. rst-class:: special

        .. [1] footnote
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'rst-class',
                isInvisibleContent: true,
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'special',
                    },
                ],
            },
        },
        {
            type: 'FootnoteDefGroup',
            children: [
                {
                    type: 'FootnoteDef',
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
        <!-- Directive id:3 children:0 directive:"rst-class" initContentText:"special" isInvisibleContent:true -->

        <dl class="footnotes special">
            <dt id="footnotedef-1">
                <span class="footnote-definition">
                    1
                </span>
            </dt>
            <dd>
                <p>
                    footnote
                </p>
            </dd>
        </dl>
    `, `
        [Directive id:3 children:0 directive:"rst-class" initContentText:"special" isInvisibleContent:true]: #

        <dl class="footnotes special">
            <dt id="footnotedef-1">
                <span class="footnote-definition">
                    1
                </span>
            </dt>
            <dd>
                <p>
                    footnote
                </p>
            </dd>
        </dl>
    `)
})

describe('when there is no next node, it does nothing', () => {
    const input = `
        .. class:: special
    `

    testGenerator(input, `
        <!-- Directive id:3 children:0 directive:"class" initContentText:"special" isInvisibleContent:true -->
    `, `
        [Directive id:3 children:0 directive:"class" initContentText:"special" isInvisibleContent:true]: #
    `)
})

describe('when a node needs to target next node but is class Directive, it targets the node after the Directive', () => {
    const input = `
        .. _mytarget:

        .. class:: special

        Hello World
    `

    testParser(input, [
        {
            type: 'HyperlinkTarget',
            data: {
                isTargetingNextNode: true,
                label: 'mytarget',
                target: '',
            },
        },
        {
            type: 'Directive',
            data: {
                directive: 'class',
                isInvisibleContent: true,
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'special',
                    },
                ],
            },
        },
        {
            type: 'Paragraph',
            text: 'Hello World',
        },
    ])

    testGenerator(input, `
        <!-- HyperlinkTarget id:1 children:0 label:"mytarget" target:"" isTargetingNextNode:true resolvedUrl:"#mytarget" -->

        <!-- Directive id:4 children:0 directive:"class" initContentText:"special" isInvisibleContent:true -->

        <p id="mytarget" class="special">
            Hello World
        </p>
    `, `
        [HyperlinkTarget id:1 children:0 label:"mytarget" target:"" isTargetingNextNode:true resolvedUrl:"#mytarget"]: #

        [Directive id:4 children:0 directive:"class" initContentText:"special" isInvisibleContent:true]: #

        <p id="mytarget" class="special">
            Hello World
        </p>
    `)
})
