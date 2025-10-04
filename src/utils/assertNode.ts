import { RstGeneratorError } from '../Generator/RstGeneratorError.ts'
import { RstGeneratorState } from '../Generator/RstGeneratorState.ts'
import { RstNode } from '../RstNode/RstNode.ts'
import type { RstNodeMap } from '../RstNode/RstNodeMap.ts'

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
