import { RstNodeType } from '@/index.js'
import { expect, test } from 'vitest'
import { parseTestInput } from './parseTestInput.js'

test('when there is an indented block, it parses blockquote', () => {
    const input = `
        paragraph

            blockquote
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(2)
    expect(root.children[1].type).toBe(RstNodeType.Blockquote)
    expect(root.children[1].getTextContent()).toBe('    blockquote')
})

test('when there are nested blocks, it parses as blockquote as a child of another blockquote', () => {
    const input = `
        paragraph

            blockquote 1

                blockquote 2
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(2)
    expect(root.children[1].type).toBe(RstNodeType.Blockquote)

    expect(root.children[1].children.length).toBe(2)
    expect(root.children[1].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[1].children[1].type).toBe(RstNodeType.Blockquote)
    expect(root.children[1].children[0].getTextContent()).toBe('    blockquote 1')
    expect(root.children[1].children[1].getTextContent()).toBe('        blockquote 2')
})

test('when there is an attribution, it parses single attribution as last child of blockquote', () => {
    const input = `
        paragraph

            blockquote 1

            -- attribution 1
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(2)
    expect(root.children[1].type).toBe(RstNodeType.Blockquote)

    expect(root.children[1].children.length).toBe(2)
    expect(root.children[1].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[1].children[1].type).toBe(RstNodeType.BlockquoteAttribution)
    expect(root.children[1].children[0].getTextContent()).toBe('    blockquote 1')
    expect(root.children[1].children[1].getTextContent()).toBe('    -- attribution 1')
})

test('when there is multiline attribution, it parses single attribution as last child of blockquote', () => {
    const input = `
        paragraph

            blockquote 1

            -- attribution 1
               attribution 2
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(2)
    expect(root.children[1].type).toBe(RstNodeType.Blockquote)

    expect(root.children[1].children.length).toBe(2)
    expect(root.children[1].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[1].children[1].type).toBe(RstNodeType.BlockquoteAttribution)
    expect(root.children[1].children[0].getTextContent()).toBe('    blockquote 1')
    expect(root.children[1].children[1].getTextContent()).includes('-- attribution 1')
    expect(root.children[1].children[1].getTextContent()).includes('   attribution 2')
})

test('when there is an attribution between indented blocks, it breaks into 2 blockquotes', () => {
    const input = `
        paragraph

            blockquote 1

            -- attribution 1

            blockquote 2
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(3)
    expect(root.children[1].type).toBe(RstNodeType.Blockquote)
    expect(root.children[2].type).toBe(RstNodeType.Blockquote)
})

test('when there is are 2 attributions, it breaks into 2 blockquotes', () => {
    const input = `
        paragraph

            blockquote 1

            -- attribution 1

            -- attribution 2
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(3)
    expect(root.children[1].type).toBe(RstNodeType.Blockquote)
    expect(root.children[2].type).toBe(RstNodeType.Blockquote)

    expect(root.children[1].children.length).toBe(2)
    expect(root.children[1].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[1].children[1].type).toBe(RstNodeType.BlockquoteAttribution)

    expect(root.children[2].children.length).toBe(1)
    expect(root.children[2].children[0].type).toBe(RstNodeType.BlockquoteAttribution)
})

test('when there is an empty comment, it breaks into 2 blockquotes', () => {
    const input = `
        paragraph

            blockquote 1

        ..

            blockquote 2
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(3)
    expect(root.children[1].type).toBe(RstNodeType.Blockquote)
    expect(root.children[2].type).toBe(RstNodeType.Blockquote)
})
