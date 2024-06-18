import { describe } from 'vitest'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { parseTestInput } from 'tests/fixtures/parseTestInput.js'
import path from 'node:path'

describe.each([
    '/',
    '/blog/',
])(':ref: InterpretedText (basePath:"%s")', (basePath) => {
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
        describe('target Section', () => {
            const doc1 = `
                :ref:\`section target\`
            `
            const doc2 = `
                Document Title
                ###

                .. _section target:

                Subsection Title
                ---
            `

            const doc1LocationFromBase = path.relative(basePath, doc1Location)
            const doc2LocationFromBase = path.relative(basePath, doc2Location)
            const sectionUrl = `${doc2Location}#subsection-title`

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
                    <a href="${sectionUrl}">Subsection Title</a>
                </p>
            `, `
                [Subsection Title](${sectionUrl})
            `)
        })

        describe('target Paragraph', () => {
            const doc1 = `
                :ref:\`My Label <paragraph target>\`
            `
            const doc2 = `
                Document Title
                ###

                .. _paragraph target:

                Hello world
            `

            const doc1LocationFromBase = path.relative(basePath, doc1Location)
            const doc2LocationFromBase = path.relative(basePath, doc2Location)
            const sectionUrl = `${doc2Location}#paragraph-1`

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
                    <a href="${sectionUrl}">My Label</a>
                </p>
            `, `
                [My Label](${sectionUrl})
            `)
        })

        describe('target InlineInternalTarget', () => {
            const doc1 = `
                :ref:\`Norwegian Blue\`
            `
            const doc2 = `
                Document Title
                ###

                Hello world _\`Norwegian Blue\`
            `

            const doc1LocationFromBase = path.relative(basePath, doc1Location)
            const doc2LocationFromBase = path.relative(basePath, doc2Location)
            const sectionUrl = `${doc2Location}#norwegian-blue`

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
                    <a href="${sectionUrl}">Norwegian Blue</a>
                </p>
            `, `
                [Norwegian Blue](${sectionUrl})
            `)
        })
    })
})
