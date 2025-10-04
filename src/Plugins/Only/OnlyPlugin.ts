import type { RstCompilerPlugin } from '../../RstCompilerPlugin.ts'
import { evaluatePythonExpr } from './parsePythonBinaryExpr.ts'
import { RstGeneratorError } from '../../Generator/RstGeneratorError.ts'

const ONLY_DIRECTIVE = 'only'

export const onlyDirectivePlugin: RstCompilerPlugin = {
    onBeforeParse: (parserOption) => {
        parserOption.directivesWithInitContent.push(ONLY_DIRECTIVE)
    },

    onInstall: (compiler) => {
        compiler.useDirectiveGenerator({
            directives: [
                ONLY_DIRECTIVE,
            ],

            generate: (generatorState, node) => {
                const exprStr = node.initContentText
                if (!exprStr) {
                    throw new RstGeneratorError(generatorState, node, 'Missing exprStr')
                }

                try {
                    const shouldShow = evaluatePythonExpr(exprStr, generatorState.opts.outputEnv)
                    if (!shouldShow) {
                        return
                    }
                } catch (err) {
                    if (err instanceof Error) {
                        throw new RstGeneratorError(generatorState, node, err.message)
                    } else {
                        throw err
                    }
                }

                generatorState.visitNodes(node.children)
            },
        })
    },
}
