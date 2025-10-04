import type { RstGeneratorState } from '../../Generator/RstGeneratorState.ts'

export function renderCodeBlockMd(generatorState: RstGeneratorState, language: string, rawCode: string) {
    generatorState.writeLine('```' + language)
    generatorState.writeLine(rawCode)
    generatorState.writeLine('```')
}
