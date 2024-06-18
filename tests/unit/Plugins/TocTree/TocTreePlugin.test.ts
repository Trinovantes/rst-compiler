import { describe } from 'vitest'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { parseTestInput } from 'tests/fixtures/parseTestInput.js'
import path from 'node:path'

describe.each([
    '/',
    '/blog/',
])('toctree (basePath:"%s")', (basePath) => {
    describe.each<{
        testName: string
        indexLocation: string
        docs: Array<{
            refPath: string
            docPath: string
        }>
    }>([
        {
            testName: 'all docs in same directory',
            indexLocation: path.join(basePath, '/index'),
            docs: [
                {
                    refPath: 'input1',
                    docPath: path.join(basePath, '/input1'),
                },
                {
                    refPath: 'input2',
                    docPath: path.join(basePath, '/input2'),
                },
                {
                    refPath: 'input3',
                    docPath: path.join(basePath, '/input3'),
                },
            ],
        },
        {
            testName: 'all docs in child directory',
            indexLocation: path.join(basePath, '/index'),
            docs: [
                {
                    refPath: 'child/input1',
                    docPath: path.join(basePath, '/child/input1'),
                },
                {
                    refPath: 'child/input2',
                    docPath: path.join(basePath, '/child/input2'),
                },
                {
                    refPath: 'child/input3',
                    docPath: path.join(basePath, '/child/input3'),
                },
            ],
        },
        {
            testName: 'all docs in parent directory',
            indexLocation: path.join(basePath, '/child/index'),
            docs: [
                {
                    refPath: '../input1',
                    docPath: path.join(basePath, '/input1'),
                },
                {
                    refPath: '../input2',
                    docPath: path.join(basePath, '/input2'),
                },
                {
                    refPath: '../input3',
                    docPath: path.join(basePath, '/input3'),
                },
            ],
        },
    ])('$testName', ({ indexLocation, docs }) => {
        const indexContents = `
            .. toctree::
                :name: My Tree

                ${docs[0].refPath}
                ${docs[1].refPath}
                ${docs[2].refPath}
        `

        const indexLocationFromBase = path.relative(basePath, indexLocation)

        testGenerator({
            basePath,
            currentDocPath: indexLocationFromBase,
            docs: [
                {
                    docPath: indexLocationFromBase,
                    parserOutput: parseTestInput(indexContents),
                },
                ...docs.map(({ refPath, docPath }) => ({
                    docPath: path.relative(basePath, docPath),
                    parserOutput: parseTestInput(`
                        Hello World (${refPath})
                        ###
                    `),
                })),
            ],
        }, `
            <ul id="my-tree" class="toc-tree">
                <li>
                    <a href="${docs[0].docPath}.html">Hello World (${docs[0].refPath})</a>
                </li>
                <li>
                    <a href="${docs[1].docPath}.html">Hello World (${docs[1].refPath})</a>
                </li>
                <li>
                    <a href="${docs[2].docPath}.html">Hello World (${docs[2].refPath})</a>
                </li>
            </ul>
        `, `
            * [Hello World (${docs[0].refPath})](${docs[0].docPath}.html)
            * [Hello World (${docs[1].refPath})](${docs[1].docPath}.html)
            * [Hello World (${docs[2].refPath})](${docs[2].docPath}.html)
        `)
    })
})
