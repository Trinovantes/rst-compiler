import { test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { parseTestInput } from '../../fixtures/parseTestInput.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('basic field list', () => {
    const input = `
        0

            :key: value
    `

    console.log(parseTestInput(input).toString())
})
