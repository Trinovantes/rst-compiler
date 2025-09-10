import { RstNode } from '../RstNode/RstNode.js'
import { RstGeneratorState } from './RstGeneratorState.js'

export class RstGeneratorError extends Error {
    constructor(generatorState: RstGeneratorState, msg: string)
    constructor(generatorState: RstGeneratorState, node: RstNode, message: string)
    constructor(generatorState: RstGeneratorState, ...args: [string] | [RstNode, string]) {
        let message = ''
        let srcNode: RstNode | null

        if (args.length === 2) {
            const [node, msg] = args
            message += msg
            srcNode = node
        } else {
            const [msg] = args
            message += msg
            srcNode = null
        }

        message += '\n'
        message += generatorState.debugInfo
        message += '\n'

        if (srcNode) {
            message += '\n'
            message += srcNode.toString()
        }

        super(message)
        this.name = 'RstGeneratorError'

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RstGeneratorError)
        }
    }
}
