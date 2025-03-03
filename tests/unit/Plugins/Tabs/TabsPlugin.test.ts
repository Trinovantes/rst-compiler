import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { testParser } from 'tests/fixtures/testParser.js'
import { describe } from 'vitest'

describe('normal tabs', () => {
    const input = `
        .. tabs::

            .. tab:: Label A

                Text A

            .. tab:: Label B

                Text B
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'tabs',
            },
            children: [
                {
                    type: 'Directive',
                    data: {
                        directive: 'tab',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'Label A',
                            },
                        ],
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'Text A',
                        },
                    ],
                },
                {
                    type: 'Directive',
                    data: {
                        directive: 'tab',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'Label B',
                            },
                        ],
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'Text B',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <rst-tabs-container>
            <rst-tab-heading data-heading="label-a" role="heading" slot="heading">
                Label A
            </rst-tab-heading>
            <rst-tab-panel role="region" slot="panel">
                <p>
                    Text A
                </p>
            </rst-tab-panel>

            <rst-tab-heading data-heading="label-b" role="heading" slot="heading">
                Label B
            </rst-tab-heading>
            <rst-tab-panel role="region" slot="panel">
                <p>
                    Text B
                </p>
            </rst-tab-panel>
        </rst-tabs-container>
    `, `
        ::: tabs
        == Label A
        Text A
        == Label B
        Text B
        :::
    `)
})

describe('group tabs', () => {
    const input = `
        .. tabs::

            .. group-tab:: Label A

                Text A

            .. group-tab:: Label B

                Text B
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'tabs',
            },
            children: [
                {
                    type: 'Directive',
                    data: {
                        directive: 'group-tab',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'Label A',
                            },
                        ],
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'Text A',
                        },
                    ],
                },
                {
                    type: 'Directive',
                    data: {
                        directive: 'group-tab',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'Label B',
                            },
                        ],
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'Text B',
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <rst-tabs-container data-group-name="group-tab">
            <rst-tab-heading data-heading="label-a" role="heading" slot="heading">
                Label A
            </rst-tab-heading>
            <rst-tab-panel role="region" slot="panel">
                <p>
                    Text A
                </p>
            </rst-tab-panel>

            <rst-tab-heading data-heading="label-b" role="heading" slot="heading">
                Label B
            </rst-tab-heading>
            <rst-tab-panel role="region" slot="panel">
                <p>
                    Text B
                </p>
            </rst-tab-panel>
        </rst-tabs-container>
    `, `
        ::: tabs key:group-tab
        == Label A
        Text A
        == Label B
        Text B
        :::
    `)
})

describe('group tabs (code)', () => {
    const input = `
        .. tabs::

            .. code-tab:: js

                Text A

            .. code-tab:: py

                Text B
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'tabs',
            },
            children: [
                {
                    type: 'Directive',
                    data: {
                        directive: 'code-tab',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'js',
                            },
                        ],
                        rawBodyText: 'Text A',
                    },
                },
                {
                    type: 'Directive',
                    data: {
                        directive: 'code-tab',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'py',
                            },
                        ],
                        rawBodyText: 'Text B',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <rst-tabs-container data-group-name="code-tab">
            <rst-tab-heading data-heading="javascript" role="heading" slot="heading">
                JavaScript
            </rst-tab-heading>
            <rst-tab-panel role="region" slot="panel">
                <pre class="code">Text A</pre>
            </rst-tab-panel>

            <rst-tab-heading data-heading="python" role="heading" slot="heading">
                Python
            </rst-tab-heading>
            <rst-tab-panel role="region" slot="panel">
                <pre class="code">Text B</pre>
            </rst-tab-panel>
        </rst-tabs-container>
    `, `
        ::: tabs key:code-tab
        == JavaScript
        \`\`\`js
        Text A
        \`\`\`
        == Python
        \`\`\`py
        Text B
        \`\`\`
        :::
    `)
})

describe('when code-group does not have a valid language label, it generates markdown code tab without a language', () => {
    const input = `
        .. tabs::

            .. code-tab:: Label A

                Text A

            .. code-tab:: c# Label B

                Text B
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'tabs',
            },
            children: [
                {
                    type: 'Directive',
                    data: {
                        directive: 'code-tab',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'Label A',
                            },
                        ],
                        rawBodyText: 'Text A',
                    },
                },
                {
                    type: 'Directive',
                    data: {
                        directive: 'code-tab',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'c# Label B',
                            },
                        ],
                        rawBodyText: 'Text B',
                    },
                },
            ],
        },
    ])

    testGenerator(input, `
        <rst-tabs-container data-group-name="code-tab">
            <rst-tab-heading data-heading="label-a" role="heading" slot="heading">
                Label A
            </rst-tab-heading>
            <rst-tab-panel role="region" slot="panel">
                <pre class="code">Text A</pre>
            </rst-tab-panel>

            <rst-tab-heading data-heading="label-b" role="heading" slot="heading">
                Label B
            </rst-tab-heading>
            <rst-tab-panel role="region" slot="panel">
                <pre class="code">Text B</pre>
            </rst-tab-panel>
        </rst-tabs-container>
    `, `
        ::: tabs key:code-tab
        == Label A
        \`\`\`txt
        Text A
        \`\`\`
        == Label B
        \`\`\`c#
        Text B
        \`\`\`
        :::
    `)
})
