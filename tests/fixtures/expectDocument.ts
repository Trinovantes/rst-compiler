import { RstNodeObject, RstNodeType } from '@/Parser/RstNode.js'
import { expect } from 'vitest'
import { parseTestInput } from './parseTestInput.js'

export function expectDocument(input: string, expectedBodyNodes: Array<RstNodeObject>): void {
    const root = parseTestInput(input)
    const output = root.toObject()
    const expectedOutput: RstNodeObject = {
        type: RstNodeType.Document,
        children: expectedBodyNodes,
    }

    console.log(root.toString())

    expect(output).toStrictEqual(expectedOutput)
}
