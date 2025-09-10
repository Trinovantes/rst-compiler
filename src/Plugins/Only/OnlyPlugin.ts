import type { RstCompilerPlugin } from '../../RstCompilerPlugin.js'
import { evaluatePythonExpr } from './parsePythonBinaryExpr.js'
import { RstGeneratorError } from '../../Generator/RstGeneratorError.js'

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
