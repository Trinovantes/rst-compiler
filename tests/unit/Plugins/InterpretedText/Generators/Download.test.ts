import path from 'node:path'
import { describe } from 'vitest'
import { testGenerator } from 'tests/fixtures/testGenerator.js'
import { parseTestInput } from 'tests/fixtures/parseTestInput.js'
import { sha1 } from '../../../../../src/utils/sha1.ts'

describe.each([
    '/',
    '/blog/',
])(':download: InterpretedText (basePath:"%s")', (basePath) => {
    describe.each<{
        testName: string
        fileName: string
        fileTarget: string
        docLocation: string
        fileLocation: string
    }>([
        {
            testName: 'target file in same directory',
            fileName: 'myfile.zip',
            fileTarget: 'myfile.zip',
            docLocation: path.join(basePath, '/index'),
            fileLocation: path.join(basePath, '/myfile.zip'),
        },
        {
            testName: 'target file in same directory',
            fileName: 'myfile.zip',
            fileTarget: './myfile.zip',
            docLocation: path.join(basePath, '/index'),
            fileLocation: path.join(basePath, '/myfile.zip'),
        },
        {
            testName: 'target file in parent directory',
            fileName: 'myfile.zip',
            fileTarget: '../myfile.zip',
            docLocation: path.join(basePath, '/child/index'),
            fileLocation: path.join(basePath, '/myfile.zip'),
        },
        {
            testName: 'target file in child directory',
            fileName: 'myfile.zip',
            fileTarget: 'child/myfile.zip',
            docLocation: path.join(basePath, '/index'),
            fileLocation: path.join(basePath, '/child/myfile.zip'),
        },
        {
            testName: 'target file in child directory',
            fileName: 'myfile.zip',
            fileTarget: './child/myfile.zip',
            docLocation: path.join(basePath, '/index'),
            fileLocation: path.join(basePath, '/child/myfile.zip'),
        },
    ])('$testName ($fileTarget resolves to $fileLocation)', ({ fileTarget, docLocation, fileLocation, fileName }) => {
        const input = `
            Click :download:\`Here <${fileTarget}>\`
        `

        const docLocationFromBase = path.relative(basePath, docLocation)
        const hash = sha1(fileLocation)

        testGenerator({
            basePath,
            currentDocPath: docLocationFromBase,
            docs: [
                {
                    docPath: docLocationFromBase,
                    parserOutput: parseTestInput(input),
                },
            ],
        }, `
            <p>
                Click <a href="${basePath}_downloads/${hash}/${fileName}" download="${fileName}">Here</a>
            </p>
        `, `
            Click <a href="${basePath}_downloads/${hash}/${fileName}" download="${fileName}">Here</a>
        `)
    })
})
