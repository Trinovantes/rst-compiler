import type { RstGeneratorState } from '../../Generator/RstGeneratorState.js'

export function renderCodeBlockMd(generatorState: RstGeneratorState, language: string, rawCode: string) {
    generatorState.writeLine('```' + language)
    generatorState.writeLine(rawCode)
    generatorState.writeLine('```')
}
