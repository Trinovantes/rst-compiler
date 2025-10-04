import type { RstGeneratorOutput } from './Generator/RstGeneratorState.ts'
import type { RstCompiler } from './RstCompiler.ts'
import type { RstParserOptions } from './Parser/RstParserOptions.ts'
import type { RstGeneratorOptions } from './Generator/RstGeneratorOptions.ts'
import type { RstNode } from './RstNode/RstNode.ts'
import type { SimpleName } from './SimpleName.ts'
import type { createDirectiveGenerators, createInterpretedTextGenerators } from './Generator/RstGenerator.ts'
import type { RstParserOutput } from './Parser/RstParserState.ts'

export type RstCompilerPlugin = Partial<{
    onInstall: (compiler: RstCompiler) => void
    getSimpleName: (node: RstNode) => SimpleName | null

    onBeforeParse: (parserOption: RstParserOptions) => void
    onParse: (parserOutput: RstParserOutput) => void

    onBeforeGenerate: (generatorOptions: RstGeneratorOptions) => void
    onGenerate: (generatorOutput: RstGeneratorOutput) => void

    isValidInterpretedText: (rawBodyText: string, role: string) => boolean | null
}>

type CreateRstCompilerPluginsOptions = Omit<RstCompilerPlugin, 'onInstall'> & {
    directiveGenerators?: Array<ReturnType<typeof createDirectiveGenerators>>
    interpretedTextGenerators?: Array<ReturnType<typeof createInterpretedTextGenerators>>
}

export function createRstCompilerPlugins(opts: CreateRstCompilerPluginsOptions) {
    const htmlPlugin: RstCompilerPlugin = {
        onInstall(compiler) {
            for (const generators of opts.directiveGenerators ?? []) {
                compiler.useDirectiveGenerator(generators.htmlGenerator)
            }
            for (const generators of opts.interpretedTextGenerators ?? []) {
                compiler.useInterpretedTextGenerator(generators.htmlGenerator)
            }
        },
        ...opts,
    }

    const mdPlugin: RstCompilerPlugin = {
        onInstall(compiler) {
            for (const generators of opts.directiveGenerators ?? []) {
                compiler.useDirectiveGenerator(generators.mdGenerator)
            }
            for (const generators of opts.interpretedTextGenerators ?? []) {
                compiler.useInterpretedTextGenerator(generators.mdGenerator)
            }
        },
        ...opts,
    }

    return {
        htmlPlugin,
        mdPlugin,
    }
}
