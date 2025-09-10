import type { RstGeneratorState } from './RstGeneratorState.js'
import type { RstNodeMap } from '../RstNode/RstNodeMap.js'
import type { RstDirective } from '../RstNode/ExplicitMarkup/Directive.js'
import type { RstInterpretedText } from '../RstNode/Inline/InterpretedText.js'

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

type RstNodeGeneratorInstance<T extends keyof RstNodeMap, ExtraGeneratorArgs extends Array<unknown>> = Readonly<{
    nodeType: T
    generate: (generatorState: RstGeneratorState, node: RstNodeMap[T], ...args: ExtraGeneratorArgs) => void
}>

export type RstNodeGenerator<T extends keyof RstNodeMap = keyof RstNodeMap, ExtraGeneratorArgs extends Array<unknown> = []> = T extends keyof RstNodeMap
    ? RstNodeGeneratorInstance<T, ExtraGeneratorArgs>
    : never

export function createNodeGenerators<
    T extends keyof RstNodeMap,
    ExtraGeneratorArgs extends Array<unknown>,
>(
    nodeType: T,
    generateHtml: RstNodeGeneratorInstance<T, ExtraGeneratorArgs>['generate'],
    generateMd?: RstNodeGeneratorInstance<T, ExtraGeneratorArgs>['generate'],
) {
    const htmlGenerator: RstNodeGeneratorInstance<T, ExtraGeneratorArgs> = {
        nodeType,
        generate: (generatorState, node, ...args: ExtraGeneratorArgs) => {
            generateHtml(generatorState, node, ...args)
        },
    }

    const mdGenerator: RstNodeGeneratorInstance<T, ExtraGeneratorArgs> = {
        nodeType,
        generate: (generatorState, node, ...args: ExtraGeneratorArgs) => {
            if (generatorState.isUsingForcedHtmlMode) {
                htmlGenerator.generate(generatorState, node, ...args)
                return
            }

            if (!generateMd) {
                generatorState.useForcedHtmlMode(() => {
                    generateHtml(generatorState, node, ...args)
                })
                return
            }

            generateMd(generatorState, node, ...args)
        },
    }

    return {
        nodeType,
        htmlGenerator,
        mdGenerator,
    }
}

// ----------------------------------------------------------------------------
// MARK: InterpretedTextGenerator
// ----------------------------------------------------------------------------

export type RstInterpretedTextGenerator = Readonly<{
    roles: ReadonlyArray<string>
    generate: (generatorState: RstGeneratorState, node: RstInterpretedText) => void
}>

export function createInterpretedTextGenerators(roles: ReadonlyArray<string>, generateHtml: RstInterpretedTextGenerator['generate'], generateMd?: RstInterpretedTextGenerator['generate']) {
    const htmlGenerator: RstInterpretedTextGenerator = {
        roles,
        generate: (generatorState, node) => {
            generateHtml(generatorState, node)
        },
    }

    const mdGenerator: RstInterpretedTextGenerator = {
        roles,
        generate: (generatorState, node) => {
            if (generatorState.isUsingForcedHtmlMode) {
                generateHtml(generatorState, node)
                return
            }

            if (!generateMd) {
                generatorState.useForcedHtmlMode(() => {
                    generateHtml(generatorState, node)
                })
                return
            }

            generateMd(generatorState, node)
        },
    }

    return {
        roles,
        htmlGenerator,
        mdGenerator,
    }
}

// ----------------------------------------------------------------------------
// MARK: DirectiveGenerator
// ----------------------------------------------------------------------------

export type RstDirectiveGenerator = Readonly<{
    directives: ReadonlyArray<string>
    generate: (generatorState: RstGeneratorState, node: RstDirective) => void
}>

export function createDirectiveGenerators(directives: ReadonlyArray<string>, generateHtml: RstDirectiveGenerator['generate'], generateMd?: RstDirectiveGenerator['generate']) {
    const htmlGenerator: RstDirectiveGenerator = {
        directives,
        generate: (generatorState, node) => {
            generateHtml(generatorState, node)
        },
    }

    const mdGenerator: RstDirectiveGenerator = {
        directives,
        generate: (generatorState, node) => {
            if (generatorState.isUsingForcedHtmlMode) {
                generateHtml(generatorState, node)
                return
            }

            if (!generateMd) {
                generatorState.useForcedHtmlMode(() => {
                    generateHtml(generatorState, node)
                })
                return
            }

            generateMd(generatorState, node)
        },
    }

    return {
        directives,
        htmlGenerator,
        mdGenerator,
    }
}
