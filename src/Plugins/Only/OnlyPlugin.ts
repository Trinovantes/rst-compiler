import { RstCompilerPlugin } from '@/RstCompilerPlugin.js'
import { evaluatePythonExpr } from './parsePythonBinaryExpr.js'

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
                    throw new Error(`Missing exprStr [${node.toShortString()}]`)
                }

                const shouldShow = evaluatePythonExpr(exprStr, generatorState.opts.outputEnv)
                if (!shouldShow) {
                    return
                }

                generatorState.visitNodes(node.children)
            },
        })
    },
}
