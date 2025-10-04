import type { RstNodeObject } from '../../src/RstNode/RstNode.ts'
import { test, expect } from 'vitest'
import { parseTestInput } from './parseTestInput.ts'
import type { RstParserOptions } from '../../src/Parser/RstParserOptions.ts'

export function testParser(input: string, expectedBodyNodes: Array<RstNodeObject>, optionsOverride?: Partial<RstParserOptions>): void {
    test('parser', () => {
        const { root } = parseTestInput(input, optionsOverride)
        const output = root.toObject()
        const expectedOutput: RstNodeObject = {
            type: 'Document',
            children: expectedBodyNodes,
        }

        expect(output).toStrictEqual(expectedOutput)
    })
}
