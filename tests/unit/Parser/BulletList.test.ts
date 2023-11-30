import { expect, test } from 'vitest'
import { parseTestInput } from './parseTestInput.js'
import { RstNodeType } from '@/index.js'
import { ListItemNode } from '@/Parser/Block/ListItemNode.js'

test('when text starts with list character and space, it parses as bullet list', () => {
    const input = `
        - test
    `

    const root = parseTestInput(input)

    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[0].children[0].type).toBe(RstNodeType.Text)
    expect((root.children[0].children[0] as ListItemNode).bullet).toBe('-')
})

test.todo('TODO', () => {
    const input = `
        - sentence 1
          sentence 2
    `

    const root = parseTestInput(input)

    expect(root.children[0].type).toBe(RstNodeType.BulletList)
    expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
    expect(root.children[0].children[0].children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].children[0].children[0].children[0].type).toBe(RstNodeType.Text)
    expect((root.children[0].children[0] as ListItemNode).bullet).toBe('-')

    // Assume there is only 1 space separating between the 2 lines
    expect(root.children[0].getTextContent()).toBe('sentence 1 sentence 2')
})

test.todo('TODO', () => {
    const input = `
        - paragraph 1

          paragraph 2
    `

    const root = parseTestInput(input)

    console.log(root.toString())
    console.log(root.toExpectString())
})

test.todo('TODO', () => {
    const input = `
        - bullet 1 paragraph 1

          bullet 1 paragraph 2

        - bullet 2 paragraph 1
    `

    const root = parseTestInput(input)

    console.log(root.toString())
    console.log(root.toExpectString())
})

test.todo('TODO', () => {
    const input = `
        - parent list

          - child list

            - grandchild list
    `

    const root = parseTestInput(input)

    console.log(root.toString())
    console.log(root.toExpectString())
})

test.todo('TODO', () => {
    const input = `
        - parent list

          - child 1 list

            - child 1 grandchild list

          - child 2 list

            - child 2 grandchild list
    `

    const root = parseTestInput(input)

    console.log(root.toString())
    console.log(root.toExpectString())
})

test.todo('TODO', () => {
    const input = `
        - The following line appears to be a new sublist, but it is not:
          - This is a paragraph continuation, not a sublist (since there's
          no blank line).  This line is also incorrectly indented.
          - Warnings may be issued by the implementation.
    `

    const root = parseTestInput(input)

    console.log(root.toString())
    console.log(root.toExpectString())
})
