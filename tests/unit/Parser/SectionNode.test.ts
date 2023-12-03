import { expect, test } from 'vitest'
import { parseTestInput } from '../../fixtures/parseTestInput.js'
import { SectionNode } from '@/Parser/Document/SectionNode.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('when there is only underline, it parses as single section', () => {
    const input = `
        test
        ---
    `
    const root = parseTestInput(input)

    expect(root.children[0].type).toBe(RstNodeType.Section)
    expect((root.children[0] as SectionNode).sectionLevel).toBe(1)
})

test('when there are overline and underline, it parses as single section', () => {
    const input = `
        ---
        test
        ---
    `
    const root = parseTestInput(input)

    expect(root.children[0].type).toBe(RstNodeType.Section)
    expect((root.children[0] as SectionNode).sectionLevel).toBe(1)
})

test('when there are multiple sections with different markers, the first section is h1 and second section is h2', () => {
    const input = `
        test1
        ---

        test2
        ===
    `
    const root = parseTestInput(input)

    expect(root.children[0].type).toBe(RstNodeType.Section)
    expect(root.children[1].type).toBe(RstNodeType.Section)
    expect((root.children[0] as SectionNode).sectionLevel).toBe(1)
    expect((root.children[1] as SectionNode).sectionLevel).toBe(2)
})

test('when overline and underline do not match, it throws an error', () => {
    const input = `
        ===
        test
        ---
    `

    expect(() => parseTestInput(input)).toThrow()
})
