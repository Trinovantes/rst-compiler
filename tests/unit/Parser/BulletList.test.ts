import { describe, expect, test } from 'vitest'
import { ListItemNode } from '@/Parser/List/ListItemNode.js'
import { RstNodeType } from '@/Parser/RstNode.js'
import { parseTestInput } from '../../fixtures/parseTestInput.js'

describe('bullet characters denotes start of bullet list', () => {
    test.each([
        ['-'],
        ['+'],
        ['*'],
    ])('"%s"', (bullet) => {
        const input = `
            ${bullet} bullet 1

            ${bullet} bullet 2
        `

        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.BulletList)
        expect(root.children[0].children.length).toBe(2)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[1].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[0].getTextContent()).toBe('bullet 1')
        expect(root.children[0].children[1].getTextContent()).toBe('bullet 2')
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe(bullet)
        expect((root.children[0].children[1] as ListItemNode).bullet).toBe(bullet)
    })
})

test('when there are line breaks in bullet, it parses as multiple paragraphs in same list item', () => {
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

test('when following line aligns with initial bullet, it parses as single paragraph in list item', () => {
    const input = `
        - sentence 1
          sentence 2
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].getTextContent()).toBe('sentence 1\nsentence 2')
})

test('when following line aligns with initial bullet and has bullet character but does not have linebreak, it parses as same paragraph', () => {
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

test('when following line does not align with initial bullet, it parses as paragraph instead of list', () => {
    const input = `
        - sentence 1
        sentence 2
    `

    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].getTextContent()).toBe('- sentence 1\nsentence 2')
})

test('when following line starts with bullet with linebreak, it parses as nested list', () => {
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

test('when multiple lines start with bullets with same indent, it parses as separate nested lists', () => {
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
