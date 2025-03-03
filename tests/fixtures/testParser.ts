import { RstNodeObject } from '@/RstNode/RstNode.js'
import { test, expect } from 'vitest'
import { parseTestInput } from './parseTestInput.js'
import { RstParserOptions } from '@/Parser/RstParserOptions.js'

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
