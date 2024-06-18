import { expect, test } from 'vitest'
import { trimCommonIndent } from '@/utils/trimCommonIndent.js'
import { RstGeneratorOptions } from '@/Generator/RstGeneratorOptions.js'
import { RstToHtmlCompiler, RstToMdCompiler } from '@/RstCompiler.js'
import { RstGeneratorInput } from '@/Generator/RstGeneratorState.js'
import { parseTestInputForGenerator } from './parseTestInput.js'
import { RstParserOptions } from '@/Parser/RstParserOptions.js'

type OptionsOverride = Partial<{
    parserOptions: Partial<RstParserOptions>
    generatorOptions: Partial<RstGeneratorOptions>
}>

function createTestGenerator(outputKey: 'body' | 'header') {
    const testGenerator = (input: string | RstGeneratorInput, expectedHtml = '', expectedMd?: string, optionsOverride?: OptionsOverride) => {
        const htmlTestName = 'html generator'
        const mdTestName = expectedMd === undefined
            ? 'markdown generator is in html mode'
            : 'markdown generator'

        const generatorOptions: Partial<RstGeneratorOptions> = {
            disableWarnings: true,
            disableErrors: false,
            ...optionsOverride?.generatorOptions,
        }

        test(htmlTestName, () => {
            const generatorInput = parseTestInputForGenerator(input, optionsOverride?.parserOptions)
            const compiler = new RstToHtmlCompiler()
            const htmlOutput = trimCommonIndent(compiler.generate(generatorInput, generatorOptions)[outputKey])
            const htmlOutputExpected = trimCommonIndent(expectedHtml)
            expect(htmlOutput).toBe(htmlOutputExpected)
        })

        test(mdTestName, () => {
            const generatorInput = parseTestInputForGenerator(input, optionsOverride?.parserOptions)
            const compiler = new RstToMdCompiler()
            const mdOutput = trimCommonIndent(compiler.generate(generatorInput, generatorOptions)[outputKey])
            const mdOutputExpected = trimCommonIndent(expectedMd ?? expectedHtml.replaceAll(/\n+/g, '\n'))
            expect(mdOutput).toBe(mdOutputExpected)
        })
    }

    testGenerator.skipIf = (shouldSkip: boolean): (...args: Parameters<typeof testGenerator>) => ReturnType<typeof testGenerator> => {
        if (shouldSkip) {
            return () => {}
        }

        return testGenerator
    }

    return testGenerator
}

export const testGenerator = createTestGenerator('body')
export const testGeneratorHeader = createTestGenerator('header')
