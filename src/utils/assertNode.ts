import { RstGeneratorError } from '@/Generator/RstGeneratorError.js'
import { RstGeneratorState } from '@/Generator/RstGeneratorState.js'
import { RstNode } from '@/RstNode/RstNode.js'
import { RstNodeMap } from '@/RstNode/RstNodeMap.js'

export function assertNode<T extends keyof RstNodeMap>(generatorState: RstGeneratorState, node: RstNode | null | undefined, expectedNodeType: T, expectedNumChildren?: number): asserts node is RstNodeMap[T] {
    if (!node) {
        throw new RstGeneratorError(generatorState, 'Is not a node')
    }

    if (node.nodeType !== expectedNodeType) {
        throw new RstGeneratorError(generatorState, node, `Is not ${expectedNodeType}`)
    }

    if (expectedNumChildren !== undefined && node.children.length !== expectedNumChildren) {
        throw new RstGeneratorError(generatorState, node, `Does not have exactly ${expectedNumChildren} child`)
    }
}
