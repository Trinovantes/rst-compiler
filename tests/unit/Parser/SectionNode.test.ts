import { expect, test } from 'vitest'
import { parseTestInput } from './parseTestInput.js'
import { RstNodeType, SectionNode } from '@/index.js'

test('when there is only underline, it parses as single section', () => {
    const input = `
        test
        ---
    `
    const root = parseTestInput(input)
    expect(root.children[0].type).toBe(RstNodeType.Section)

    const section = root.children[0] as SectionNode
    expect(section.sectionLevel).toBe(1)
})

test('when there are overline and underline, it parses as single section', () => {
    const input = `
        ---
        test
        ---
    `
    const root = parseTestInput(input)
    expect(root.children[0].type).toBe(RstNodeType.Section)

    const section = root.children[0] as SectionNode
    expect(section.sectionLevel).toBe(1)
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

    const section1 = root.children[0] as SectionNode
    const section2 = root.children[1] as SectionNode
    expect(section1.sectionLevel).toBe(1)
    expect(section2.sectionLevel).toBe(2)
})

test('when overline and underline do not match, it throws an error', () => {
    const input = `
        ===
        test
        ---
    `
    expect(() => parseTestInput(input)).toThrow()
})
