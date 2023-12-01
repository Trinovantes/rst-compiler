import { expect, test } from 'vitest'
import { parseTestInput } from './parseTestInput.js'
import { RstNodeType } from '@/index.js'
import { ListItemNode } from '@/Parser/Block/ListItemNode.js'

test('when text starts with list character and space, it parses as bullet list', () => {
    const input = `
        - test
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[0].children[0].type).toBe(RstNodeType.Text)
    expect((root.children[0].children[0] as ListItemNode).bullet).toBe('-')
})

test('when following lines aligns with initial bullet, it parses as single paragraph', () => {
    const input = `
        - sentence 1
          sentence 2
          sentence 3
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].getTextContent()).toBe('sentence 1\nsentence 2\nsentence 3')
})

test('when following line do not align with initial bullet, it parses as separate paragraph', () => {
    const input = `
        - sentence 1
        sentence 2
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(2)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[1].type).toBe(RstNodeType.Paragraph)

    expect(root.children[0].getTextContent()).toBe('sentence 1')
})

test('when following line aligns with initial bullet without linebreak, it parses as same paragraph', () => {
    const input = `
        - The following line appears to be a new sublist, but it is not:
          - This is a paragraph continuation, not a sublist (since there's
          no blank line).  This line is also incorrectly indented.
          - Warnings may be issued by the implementation.
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children.length).toBe(1)
    expect(root.children[0].children[0].children[0].type).toBe(RstNodeType.Paragraph)
})

test('when there are line breaks in bullet, it parses as multiple paragraphs in same ListItem', () => {
    const input = `
        - paragraph 1

          paragraph 2
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children.length).toBe(2)
    expect(root.children[0].children[0].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[1].type).toBe(RstNodeType.Paragraph)

    expect(root.children[0].children[0].children[0].getTextContent()).toBe('paragraph 1')
    expect(root.children[0].children[0].children[1].getTextContent()).toBe('paragraph 2')
})

test('when a following line starts with list character and space with no indent, it parses as new ListItem in same BulletList', () => {
    const input = `
        - bullet 1 paragraph 1

          bullet 1 paragraph 2

        - bullet 2 paragraph 1
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children.length).toBe(2)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[1].type).toBe(RstNodeType.ListItem)
})

test('when a following line starts with list character and space with same indent, it parses as new BulletList', () => {
    const input = `
        - parent list

          - child list

            - grandchild list
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children.length).toBe(2)
    expect(root.children[0].children[0].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[1].type).toBe(RstNodeType.BulletList)

    expect(root.children[0].children[0].children[1].children.length).toBe(1)
    expect(root.children[0].children[0].children[1].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children[1].children[0].children.length).toBe(2)
    expect(root.children[0].children[0].children[1].children[0].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[1].children[0].children[1].type).toBe(RstNodeType.BulletList)

    expect(root.children[0].children[0].children[1].children[0].children[1].children.length).toBe(1)
    expect(root.children[0].children[0].children[1].children[0].children[1].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children[1].children[0].children[1].children[0].children.length).toBe(1)
    expect(root.children[0].children[0].children[1].children[0].children[1].children[0].children[0].type).toBe(RstNodeType.Paragraph)
})

test('when multiple lines start with list character and space with same indent, it parses as separate BulletList', () => {
    const input = `
        - parent list

          - child 1 list

            - child 1 grandchild list

          - child 2 list

            - child 2 grandchild list
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children.length).toBe(2)
    expect(root.children[0].children[0].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[1].type).toBe(RstNodeType.BulletList)

    expect(root.children[0].children[0].children[1].children.length).toBe(2)
    expect(root.children[0].children[0].children[1].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children[1].children[1].type).toBe(RstNodeType.ListItem)

    expect((root.children[0].children[0].children[1].children[0] as ListItemNode).bullet).toBe('-')
    expect(root.children[0].children[0].children[1].children[0].children.length).toBe(2)
    expect(root.children[0].children[0].children[1].children[0].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[1].children[0].children[1].type).toBe(RstNodeType.BulletList)

    expect((root.children[0].children[0].children[1].children[1] as ListItemNode).bullet).toBe('-')
    expect(root.children[0].children[0].children[1].children[1].children.length).toBe(2)
    expect(root.children[0].children[0].children[1].children[1].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[1].children[1].children[1].type).toBe(RstNodeType.BulletList)
})
