import { describe } from 'vitest'
import { testParser } from 'tests/fixtures/testParser.js'
import { trimCommonIndent } from '../../../../src/utils/trimCommonIndent.js'

describe('with no data', () => {
    const input = `
        .. directive::
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'directive',
            },
        },
    ])
})

describe('with data on same line', () => {
    const input = `
        .. directive:: data
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'directive',
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'data',
                },
            ],
        },
    ])
})

describe('with data on next line (indented 2)', () => {
    const input = `
        .. directive::
          data
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'directive',
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'data',
                },
            ],
        },
    ])
})

describe('with data on next line (indented 3)', () => {
    const input = `
        .. directive::
           data
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'directive',
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'data',
                },
            ],
        },
    ])
})

describe('with data on next line (indented 4)', () => {
    const input = `
        .. directive::
            data
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'directive',
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'data',
                },
            ],
        },
    ])
})

describe('with data on multiple lines (aligned to colons)', () => {
    const input = `
        .. note:: This documentation is translated from the \`original English one
                  <https://docs.godotengine.org/en/stable>\`_ by community members
                  on \`Weblate <https://hosted.weblate.org/projects/godot-engine/godot-docs>\`_.

                  :hidden:
                  :maxdepth: 1
                  
                  about/introduction
                  about/faq
                  about/troubleshooting
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'note',
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'hidden',
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
                                        text: 'maxdepth',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: '1',
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
                            text: ' by community members\non ',
                        },
                        {
                            type: 'HyperlinkRef',
                            text: 'Weblate',
                            data: {
                                label: 'Weblate',
                                target: 'https://hosted.weblate.org/projects/godot-engine/godot-docs',
                                isEmbeded: true,
                            },
                        },
                        {
                            type: 'Text',
                            text: '.',
                        },
                    ],
                },
                {
                    type: 'Paragraph',
                    text: 'about/introduction\nabout/faq\nabout/troubleshooting',
                },
            ],
        },
    ])
})

describe('with data on multiple lines (aligned to 2 spaces)', () => {
    const input = `
        .. note:: This documentation is translated from the \`original English one
          <https://docs.godotengine.org/en/stable>\`_ by community members
          on \`Weblate <https://hosted.weblate.org/projects/godot-engine/godot-docs>\`_.

          :hidden:
          :maxdepth: 1
          
          about/introduction
          about/faq
          about/troubleshooting
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'note',
                config: {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'hidden',
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
                                        text: 'maxdepth',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: '1',
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
                            text: ' by community members\non ',
                        },
                        {
                            type: 'HyperlinkRef',
                            text: 'Weblate',
                            data: {
                                label: 'Weblate',
                                target: 'https://hosted.weblate.org/projects/godot-engine/godot-docs',
                                isEmbeded: true,
                            },
                        },
                        {
                            type: 'Text',
                            text: '.',
                        },
                    ],
                },
                {
                    type: 'Paragraph',
                    text: 'about/introduction\nabout/faq\nabout/troubleshooting',
                },
            ],
        },
    ])
})

describe('nested Directives', () => {
    const input = `
        .. only:: not i18n

          .. note:: Godot's documentation is available in various languages and versions.
                    Expand the "Read the Docs" panel at the bottom of the sidebar to see
                    the list.
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'only',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'not i18n',
                    },
                ],
            },
            children: [
                {
                    type: 'Directive',
                    data: {
                        directive: 'note',
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'Godot\'s documentation is available in various languages and versions.\nExpand the "Read the Docs" panel at the bottom of the sidebar to see\nthe list.',
                        },
                    ],
                },
            ],
        },
    ])
})

describe('with raw text whose lowest indentation is not first non-blank line', () => {
    const input = `
        .. code:: csharp

                public override void _Ready()
                {
            #if GODOT_SERVER
                    // Don't try to load meshes or anything, this is a server!
                    LaunchServer();
            #elif GODOT_32 || GODOT_MOBILE || GODOT_WEB
                    // Use simple objects when running on less powerful systems.
                    SpawnSimpleObjects();
            #else
                    SpawnComplexObjects();
            #endif
                }

    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'code',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'csharp',
                    },
                ],
                rawBodyText: trimCommonIndent(`
                        public override void _Ready()
                        {
                    #if GODOT_SERVER
                            // Don't try to load meshes or anything, this is a server!
                            LaunchServer();
                    #elif GODOT_32 || GODOT_MOBILE || GODOT_WEB
                            // Use simple objects when running on less powerful systems.
                            SpawnSimpleObjects();
                    #else
                            SpawnComplexObjects();
                    #endif
                        }
                `),
            },
        },
    ])
})
