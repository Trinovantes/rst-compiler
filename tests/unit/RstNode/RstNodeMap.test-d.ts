import { test, assertType } from 'vitest'
import type { RstNodeMap, RstNodeType } from '../../../src/index.ts'

test('keyof RstNodeMap is subset of RstNodeType', () => {
    assertType<RstNodeType>('' as keyof RstNodeMap)
})
