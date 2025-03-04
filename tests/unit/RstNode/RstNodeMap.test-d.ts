import { test, assertType } from 'vitest'
import { RstNodeMap, RstNodeType } from '@/index.js'

test('keyof RstNodeMap is subset of RstNodeType', () => {
    assertType<RstNodeType>('' as keyof RstNodeMap)
})
