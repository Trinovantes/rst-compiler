import { describe, expect, test } from 'vitest'
import { parseTestInput } from '../../fixtures/parseTestInput.js'
import { RstNodeType } from '@/Parser/RstNode.js'
import { ListItemNode } from '@/Parser/List/ListItemNode.js'
import { EnumeratedListNode } from '@/Parser/List/EnumeratedListNode.js'
import { EnumeratedListType } from '@/Parser/List/EnumeratedListType.js'

describe('enumerations denote start of enumerated list', () => {
    test('arabic numerals', () => {
        const input = `
            1. arabic numerals 1

            2. arabic numerals 2

            3. arabic numerals 3
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)

        expect(root.children[0].children.length).toBe(3)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[1].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[2].type).toBe(RstNodeType.ListItem)
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('1')
        expect((root.children[0].children[1] as ListItemNode).bullet).toBe('2')
        expect((root.children[0].children[2] as ListItemNode).bullet).toBe('3')
        expect(root.children[0].children[0].children[0].getTextContent()).toBe('arabic numerals 1')
        expect(root.children[0].children[1].children[0].getTextContent()).toBe('arabic numerals 2')
        expect(root.children[0].children[2].children[0].getTextContent()).toBe('arabic numerals 3')
    })

    test('lowercase alphabet characters', () => {
        const input = `
            a. lowercase alphabet 1

            b. lowercase alphabet 2

            c. lowercase alphabet 3
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)

        expect(root.children[0].children.length).toBe(3)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[1].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[2].type).toBe(RstNodeType.ListItem)
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('a')
        expect((root.children[0].children[1] as ListItemNode).bullet).toBe('b')
        expect((root.children[0].children[2] as ListItemNode).bullet).toBe('c')
        expect(root.children[0].children[0].children[0].getTextContent()).toBe('lowercase alphabet 1')
        expect(root.children[0].children[1].children[0].getTextContent()).toBe('lowercase alphabet 2')
        expect(root.children[0].children[2].children[0].getTextContent()).toBe('lowercase alphabet 3')
    })

    test('uppercase alphabet characters', () => {
        const input = `
            A. uppercase alphabet 1

            B. uppercase alphabet 2

            C. uppercase alphabet 3
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)

        expect(root.children[0].children.length).toBe(3)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[1].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[2].type).toBe(RstNodeType.ListItem)
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('A')
        expect((root.children[0].children[1] as ListItemNode).bullet).toBe('B')
        expect((root.children[0].children[2] as ListItemNode).bullet).toBe('C')
        expect(root.children[0].children[0].children[0].getTextContent()).toBe('uppercase alphabet 1')
        expect(root.children[0].children[1].children[0].getTextContent()).toBe('uppercase alphabet 2')
        expect(root.children[0].children[2].children[0].getTextContent()).toBe('uppercase alphabet 3')
    })

    test('roman numerals (uppercase)', () => {
        const input = `
            I. uppercase roman numerals 1

            II. uppercase roman numerals 2

            III. uppercase roman numerals 3
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)

        expect(root.children[0].children.length).toBe(3)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[1].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[2].type).toBe(RstNodeType.ListItem)
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('I')
        expect((root.children[0].children[1] as ListItemNode).bullet).toBe('II')
        expect((root.children[0].children[2] as ListItemNode).bullet).toBe('III')
        expect(root.children[0].children[0].children[0].getTextContent()).toBe('uppercase roman numerals 1')
        expect(root.children[0].children[1].children[0].getTextContent()).toBe('uppercase roman numerals 2')
        expect(root.children[0].children[2].children[0].getTextContent()).toBe('uppercase roman numerals 3')
    })

    test('roman numerals (lowercase)', () => {
        const input = `
            i. lowercase roman numerals 1

            ii. lowercase roman numerals 2

            iii. lowercase roman numerals 3
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)

        expect(root.children[0].children.length).toBe(3)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[1].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[2].type).toBe(RstNodeType.ListItem)
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('i')
        expect((root.children[0].children[1] as ListItemNode).bullet).toBe('ii')
        expect((root.children[0].children[2] as ListItemNode).bullet).toBe('iii')
        expect(root.children[0].children[0].children[0].getTextContent()).toBe('lowercase roman numerals 1')
        expect(root.children[0].children[1].children[0].getTextContent()).toBe('lowercase roman numerals 2')
        expect(root.children[0].children[2].children[0].getTextContent()).toBe('lowercase roman numerals 3')
    })

    test('auto-enumerator', () => {
        const input = `
            #. auto 1

            #. auto 2

            #. auto 3
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)

        expect(root.children[0].children.length).toBe(3)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[1].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[2].type).toBe(RstNodeType.ListItem)
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('#')
        expect((root.children[0].children[1] as ListItemNode).bullet).toBe('#')
        expect((root.children[0].children[2] as ListItemNode).bullet).toBe('#')
        expect(root.children[0].children[0].children[0].getTextContent()).toBe('auto 1')
        expect(root.children[0].children[1].children[0].getTextContent()).toBe('auto 2')
        expect(root.children[0].children[2].children[0].getTextContent()).toBe('auto 3')
    })
})

describe('formatting', () => {
    test('suffixed with a period', () => {
        const input = `
            1. list 1
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)
        expect(root.children[0].children.length).toBe(1)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[0].getTextContent()).toBe('list 1')
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('1')
    })

    test('suffixed with a right-paranthesis', () => {
        const input = `
            1) list 1
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)
        expect(root.children[0].children.length).toBe(1)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[0].getTextContent()).toBe('list 1')
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('1')
    })

    test('surrounded by paranthesis', () => {
        const input = `
            (1) list 1
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)
        expect(root.children[0].children.length).toBe(1)
        expect(root.children[0].children[0].type).toBe(RstNodeType.ListItem)
        expect(root.children[0].children[0].getTextContent()).toBe('list 1')
        expect((root.children[0].children[0] as ListItemNode).bullet).toBe('1')
    })

    test('when there is an opening paranthesis but no closing paranthesis, it does not parse as list', () => {
        const input = `
            (1 list 1
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(1)
        expect(root.children[0].type).toBe(RstNodeType.Paragraph)
        expect(root.children[0].getTextContent()).toBe('(1 list 1')
    })
})

test('when second line is not indented, it is parsed as paragraph instead', () => {
    const input = `
        A. Einstein was a really
        smart dude.
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.Paragraph)
    expect(root.children[0].getTextContent()).toBe('A. Einstein was a really\nsmart dude.')
})

test('when enumerators do not have the same sequence, it starts a new list', () => {
    const input = `
        1. list 1

        a. list 2
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(2)
    expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)
    expect(root.children[1].type).toBe(RstNodeType.EnumeratedList)
    expect((root.children[0] as EnumeratedListNode).listType).toBe(EnumeratedListType.Arabic)
    expect((root.children[1] as EnumeratedListNode).listType).toBe(EnumeratedListType.AlphabetLower)
    expect(root.children[0].getTextContent()).toBe('list 1')
    expect(root.children[1].getTextContent()).toBe('list 2')
})

describe('when enumerators are not in sequence, it starts a new list', () => {
    test('for arabic', () => {
        const input = `
            1. list 1

            3. list 2
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(2)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)
        expect(root.children[1].type).toBe(RstNodeType.EnumeratedList)
        expect((root.children[0] as EnumeratedListNode).listType).toBe(EnumeratedListType.Arabic)
        expect((root.children[1] as EnumeratedListNode).listType).toBe(EnumeratedListType.Arabic)
        expect(root.children[0].getTextContent()).toBe('list 1')
        expect(root.children[1].getTextContent()).toBe('list 2')
    })

    test('for alphabet', () => {
        const input = `
            a. list 1

            c. list 2
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(2)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)
        expect(root.children[1].type).toBe(RstNodeType.EnumeratedList)
        expect((root.children[0] as EnumeratedListNode).listType).toBe(EnumeratedListType.AlphabetLower)
        expect((root.children[1] as EnumeratedListNode).listType).toBe(EnumeratedListType.AlphabetLower)
        expect(root.children[0].getTextContent()).toBe('list 1')
        expect(root.children[1].getTextContent()).toBe('list 2')
    })

    test('for roman', () => {
        const input = `
            i. list 1

            iii. list 2
        `
        const root = parseTestInput(input)

        expect(root.children.length).toBe(2)
        expect(root.children[0].type).toBe(RstNodeType.EnumeratedList)
        expect(root.children[1].type).toBe(RstNodeType.EnumeratedList)
        expect((root.children[0] as EnumeratedListNode).listType).toBe(EnumeratedListType.RomanLower)
        expect((root.children[1] as EnumeratedListNode).listType).toBe(EnumeratedListType.RomanLower)
        expect(root.children[0].getTextContent()).toBe('list 1')
        expect(root.children[1].getTextContent()).toBe('list 2')
    })
})
