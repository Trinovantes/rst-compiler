import { describe } from 'vitest'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { parseTestInput } from 'tests/fixtures/parseTestInput.js'
import path from 'node:path'
import { testParser } from 'tests/fixtures/testParser.js'

describe.each<{
    directive: string
    role: string
}>([
    {
        directive: 'js:module',
        role: 'js:mod',
    },
    {
        directive: 'js:function',
        role: 'js:func',
    },
    {
        directive: 'js:method',
        role: 'js:meth',
    },
    {
        directive: 'js:class',
        role: 'js:class',
    },
    {
        directive: 'js:data',
        role: 'js:data',
    },
    {
        directive: 'js:attribute',
        role: 'js:attr',
    },
])('js:module', ({ directive, role }) => {
    describe('same document', () => {
        const input = `
            .. ${directive}:: MyModuleName

                Hello World

            :${role}:\`MyModuleName\`
        `

        testParser(input, [
            {
                type: 'Directive',
                data: {
                    directive,
                    initContent: [
                        {
                            type: 'Paragraph',
                            text: 'MyModuleName',
                        },
                    ],
                },
                children: [
                    {
                        type: 'Paragraph',
                        text: 'Hello World',
                    },
                ],
            },
            {
                type: 'Paragraph',
                children: [
                    {
                        type: 'InterpretedText',
                        text: 'MyModuleName',
                        data: {
                            role,
                        },
                    },
                ],
            },
        ])

        testGenerator(input, `
            <dl id="js-mymodulename" class="${directive.replace(':', ' ')}">
                <dt>
                    <code>MyModuleName</code>
                    <a href="#js-mymodulename">&para;</a>
                </dt>
                <dd>
                    <p>
                        Hello World
                    </p>
                </dd>
            </dl>

            <p>
                <a href="#js-mymodulename">MyModuleName</a>
            </p>
        `, `
            <dl id="js-mymodulename" class="${directive.replace(':', ' ')}">
                <dt>
                    <code>MyModuleName</code>
                    <a href="#js-mymodulename">&para;</a>
                </dt>
                <dd>
                    <p>
                        Hello World
                    </p>
                </dd>
            </dl>

            [MyModuleName](#js-mymodulename)
        `)
    })

    describe.each([
        '/',
        '/blog/',
    ])('cross doc references (basePath:"%s")', (basePath) => {
        describe.each<{
            testName: string
            doc2Target: string
            doc1Location: string
            doc2Location: string
        }>([
            {
                testName: 'both docs in same directory',
                doc2Target: 'input2',
                doc1Location: path.join(basePath, '/input1'),
                doc2Location: path.join(basePath, '/input2'),
            },
            {
                testName: 'target doc in child directory',
                doc2Target: 'child/input2',
                doc1Location: path.join(basePath, '/input1'),
                doc2Location: path.join(basePath, '/child/input2'),
            },
            {
                testName: 'target doc in parent directory',
                doc2Target: '../input2',
                doc1Location: path.join(basePath, '/child/input1'),
                doc2Location: path.join(basePath, '/input2'),
            },
            {
                testName: 'target doc is absolute path',
                doc2Target: '/d/e/f/input2',
                doc1Location: path.join(basePath, '/a/b/c/input1'),
                doc2Location: path.join(basePath, '/d/e/f/input2'),
            },
        ])('$testName', ({ doc1Location, doc2Location }) => {
            const doc1 = `
                :${role}:\`ModuleName\`
            `
            const doc2 = `
                Document Title
                ###

                .. ${directive}:: ModuleName

                    Hello World
            `

            const doc1LocationFromBase = path.relative(basePath, doc1Location)
            const doc2LocationFromBase = path.relative(basePath, doc2Location)
            const sectionUrl = `${doc2Location}#js-modulename`

            testGenerator({
                basePath,
                currentDocPath: doc1LocationFromBase,
                docs: [
                    {
                        docPath: doc1LocationFromBase,
                        parserOutput: parseTestInput(doc1),
                    },
                    {
                        docPath: doc2LocationFromBase,
                        parserOutput: parseTestInput(doc2),
                    },
                ],
            }, `
                <p>
                    <a href="${sectionUrl}">ModuleName</a>
                </p>
            `, `
                [ModuleName](${sectionUrl})
            `)
        })
    })
})

describe('js:function inside js:class inherits class name', () => {
    const input = `
        .. js:class:: Engine( initConfig )

            Create a new Engine instance with the given configuration.

            :param EngineConfig initConfig:
                The initial config for this instance.

            **Static Methods**

            .. js:function:: load( basePath )

                Load the engine from the specified base path.

                :param string basePath:
                    Base path of the engine to load.

                :return:
                    A Promise that resolves once the engine is loaded.

                :rtype: Promise
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'js:class',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: 'Engine( initConfig )',
                    },
                ],
            },
            children: [
                {
                    type: 'Paragraph',
                    text: 'Create a new Engine instance with the given configuration.',
                },
                {
                    type: 'FieldList',
                    children: [
                        {
                            type: 'FieldListItem',
                            data: {
                                name: [
                                    {
                                        type: 'Text',
                                        text: 'param EngineConfig initConfig',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'The initial config for this instance.',
                                    },
                                ],
                            },
                        },
                    ],
                },
                {
                    type: 'Paragraph',
                    children: [
                        {
                            type: 'StrongEmphasis',
                            text: 'Static Methods',
                        },
                    ],
                },
                {
                    type: 'Directive',
                    data: {
                        directive: 'js:function',
                        initContent: [
                            {
                                type: 'Paragraph',
                                text: 'load( basePath )',
                            },
                        ],
                    },
                    children: [
                        {
                            type: 'Paragraph',
                            text: 'Load the engine from the specified base path.',
                        },
                        {
                            type: 'FieldList',
                            children: [
                                {
                                    type: 'FieldListItem',
                                    data: {
                                        name: [
                                            {
                                                type: 'Text',
                                                text: 'param string basePath',
                                            },
                                        ],
                                        body: [
                                            {
                                                type: 'Paragraph',
                                                text: 'Base path of the engine to load.',
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
                                                text: 'return',
                                            },
                                        ],
                                        body: [
                                            {
                                                type: 'Paragraph',
                                                text: 'A Promise that resolves once the engine is loaded.',
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
                                                text: 'rtype',
                                            },
                                        ],
                                        body: [
                                            {
                                                type: 'Paragraph',
                                                text: 'Promise',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ])

    testGenerator(input, `
        <dl id="js-engine" class="js class">
            <dt>
                <code>Engine( initConfig )</code>
                <a href="#js-engine">&para;</a>
            </dt>
            <dd>
                <p>
                    Create a new Engine instance with the given configuration.
                </p>

                <dl>
                    <dt>
                        Arguments
                    </dt>
                    <dd>
                        <strong>initConfig (<code>EngineConfig</code>)</strong> &mdash; The initial config for this instance.
                    </dd>
                </dl>

                <p>
                    <strong>Static Methods</strong>
                </p>

                <dl id="js-engine-load" class="js function">
                    <dt>
                        <code>Engine.load( basePath )</code>
                        <a href="#js-engine-load">&para;</a>
                    </dt>
                    <dd>
                        <p>
                            Load the engine from the specified base path.
                        </p>

                        <dl>
                            <dt>
                                Arguments
                            </dt>
                            <dd>
                                <strong>basePath (<code>string</code>)</strong> &mdash; Base path of the engine to load.
                            </dd>
                            <dt>
                                Return
                            </dt>
                            <dd>
                                 A Promise that resolves once the engine is loaded.
                            </dd>
                            <dt>
                                Return Type
                            </dt>
                            <dd>
                                 Promise
                            </dd>
                        </dl>
                    </dd>
                </dl>
            </dd>
        </dl>
    `)
})

describe('multiple params in js:function are consoldated into single list', () => {
    const input = `
        .. js:function:: $.getJSON(href, callback[, errback])

            :param string href: An URI to the location of the resource.
            :param callback: Gets called with the object.
            :param errback:
                Gets called in case the request fails. And a lot of other
                text so we need multiple lines.
            :throws SomeError: For whatever reason in that case.
            :returns: Something.
    `

    testParser(input, [
        {
            type: 'Directive',
            data: {
                directive: 'js:function',
                initContent: [
                    {
                        type: 'Paragraph',
                        text: '$.getJSON(href, callback[, errback])',
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
                                        text: 'param string href',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'An URI to the location of the resource.',
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
                                        text: 'param callback',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'Gets called with the object.',
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
                                        text: 'param errback',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'Gets called in case the request fails. And a lot of other\ntext so we need multiple lines.',
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
                                        text: 'throws SomeError',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'For whatever reason in that case.',
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
                                        text: 'returns',
                                    },
                                ],
                                body: [
                                    {
                                        type: 'Paragraph',
                                        text: 'Something.',
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
        <dl id="js-getjson" class="js function">
            <dt>
                <code>$.getJSON(href, callback[, errback])</code>
                <a href="#js-getjson">&para;</a>
            </dt>
            <dd>
                <dl>
                    <dt>
                        Arguments
                    </dt>
                    <dd>
                        <ul>
                            <li>
                                <strong>href (<code>string</code>)</strong> &mdash; An URI to the location of the resource.
                            </li>
                            <li>
                                <strong>callback</strong> &mdash; Gets called with the object.
                            </li>
                            <li>
                                <strong>errback</strong> &mdash; Gets called in case the request fails. And a lot of other
                                text so we need multiple lines.
                            </li>
                        </ul>
                    </dd>
                    <dt>
                        Throws
                    </dt>
                    <dd>
                         For whatever reason in that case.
                    </dd>
                    <dt>
                        Returns
                    </dt>
                    <dd>
                         Something.
                    </dd>
                </dl>
            </dd>
        </dl>
    `)
})
