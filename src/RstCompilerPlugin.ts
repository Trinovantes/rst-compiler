import type { RstGeneratorOutput } from './Generator/RstGeneratorState.js'
import type { RstCompiler } from './RstCompiler.js'
import type { RstParserOptions } from './Parser/RstParserOptions.js'
import type { RstGeneratorOptions } from './Generator/RstGeneratorOptions.js'
import type { RstNode } from './RstNode/RstNode.js'
import type { SimpleName } from './SimpleName.js'
import type { createDirectiveGenerators, createInterpretedTextGenerators } from './Generator/RstGenerator.js'
import type { RstParserOutput } from './Parser/RstParserState.js'

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
