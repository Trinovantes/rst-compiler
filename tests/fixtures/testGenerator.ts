import { expect, test } from 'vitest'
import { trimCommonIndent } from '../../src/utils/trimCommonIndent.ts'
import type { RstGeneratorOptions } from '../../src/Generator/RstGeneratorOptions.ts'
import { RstToHtmlCompiler, RstToMdCompiler } from '../../src/RstCompiler.ts'
import type { RstGeneratorInput } from '../../src/Generator/RstGeneratorState.ts'
import { parseTestInputForGeneratorInput } from './parseTestInput.ts'
import type { RstParserOptions } from '../../src/Parser/RstParserOptions.ts'

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
            const generatorInput = parseTestInputForGeneratorInput(input, optionsOverride?.parserOptions)
            const compiler = new RstToHtmlCompiler()
            const htmlOutput = trimCommonIndent(compiler.generate(generatorInput, generatorOptions)[outputKey])
            const htmlOutputExpected = trimCommonIndent(expectedHtml)
            expect(htmlOutput).toBe(htmlOutputExpected)
        })

        test(mdTestName, () => {
            const generatorInput = parseTestInputForGeneratorInput(input, optionsOverride?.parserOptions)
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
