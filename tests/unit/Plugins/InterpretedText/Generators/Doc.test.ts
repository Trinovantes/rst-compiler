import { describe } from 'vitest'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { parseTestInput } from 'tests/fixtures/parseTestInput.js'
import path from 'node:path'

describe.each([
    '/',
    '/blog/',
])(':doc: InterpretedText (basePath:"%s")', (basePath) => {
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
    ])('$testName ($doc2Target resolves to $doc2Location)', ({ doc2Target, doc1Location, doc2Location }) => {
        const doc1 = `
            :doc:\`${doc2Target}\`
        `
        const doc2 = `
            Hello World
            ###
        `

        const doc1LocationFromBase = path.relative(basePath, doc1Location)
        const doc2LocationFromBase = path.relative(basePath, doc2Location)

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
                <a href="${doc2Location}.html">Hello World</a>
            </p>
        `, `
            [Hello World](${doc2Location}.html)
        `)
    })
})
