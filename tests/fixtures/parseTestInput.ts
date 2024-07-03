import { RstToHtmlCompiler } from '@/RstCompiler.js'
import { trimCommonIndent } from '@/utils/trimCommonIndent.js'
import { RstGeneratorInput, RstGeneratorState } from '@/Generator/RstGeneratorState.js'
import { RstParserOptions } from '@/Parser/RstParserOptions.js'
import { RstParserOutput } from '@/Parser/RstParserState.js'
import { createDefaultGeneratorOptions } from '@/Generator/RstGeneratorOptions.js'

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
