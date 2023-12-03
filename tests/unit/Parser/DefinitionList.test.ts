import { test } from 'vitest'
import { parseTestInput } from '../../fixtures/parseTestInput.js'

test('', () => {
    const input = `
        term
            definition
    `
    const root = parseTestInput(input)

    console.log(root.toString())
})
