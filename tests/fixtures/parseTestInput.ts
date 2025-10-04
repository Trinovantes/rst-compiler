import { RstToHtmlCompiler } from '../../src/RstCompiler.ts'
import { trimCommonIndent } from '../../src/utils/trimCommonIndent.ts'
import { type RstGeneratorInput, RstGeneratorState } from '../../src/Generator/RstGeneratorState.ts'
import type { RstParserOptions } from '../../src/Parser/RstParserOptions.ts'
import type { RstParserOutput } from '../../src/Parser/RstParserState.ts'
import { createDefaultGeneratorOptions } from '../../src/Generator/RstGeneratorOptions.ts'

export function parseTestInput(input: string, parserOptionsOverride?: Partial<RstParserOptions>): RstParserOutput {
    const parserOptions: Partial<RstParserOptions> = {
        disableWarnings: true,
        disableErrors: false,
        parseFirstFieldListAsDocumentMeta: false,
        ...parserOptionsOverride,
    }

    const compiler = new RstToHtmlCompiler()
    const trimmedInput = trimCommonIndent(input)
    const parserOutput = compiler.parse(trimmedInput, parserOptions)

    return parserOutput
}

export function parseTestInputForGeneratorInput(input: string | RstGeneratorInput, parserOptionsOverride?: Partial<RstParserOptions>): RstGeneratorInput {
    if (typeof input !== 'string') {
        return input
    }

    const basePath = '/'
    const docPath = 'index'
    const parserOutput = parseTestInput(input, parserOptionsOverride)

    return {
        basePath,
        currentDocPath: docPath,
        docs: [
            {
                docPath,
                parserOutput,
            },
        ],
    }
}

export function parseTestInputForGeneratorState(input: string | RstGeneratorInput, parserOptionsOverride?: Partial<RstParserOptions>): RstGeneratorState {
    const generatorInput = parseTestInputForGeneratorInput(input, parserOptionsOverride)
    const generatorState = new RstGeneratorState(createDefaultGeneratorOptions(), generatorInput, new RstToHtmlCompiler())
    return generatorState
}
