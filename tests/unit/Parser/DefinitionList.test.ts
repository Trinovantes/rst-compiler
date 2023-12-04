import { expect, test } from 'vitest'
import { parseTestInput } from '../../fixtures/parseTestInput.js'
import { RstNodeType } from '@/Parser/RstNode.js'
import { DefinitionListItemNode } from '@/Parser/List/DefinitionList.js'

test('no classifier', () => {
    const input = `
        term
            definition
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.DefinitionList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.DefinitionListItem)
    expect((root.children[0].children[0] as DefinitionListItemNode).term.getTextContent()).toBe('term')
    expect((root.children[0].children[0] as DefinitionListItemNode).classifiers.length).toBe(0)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes.length).toBe(1)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].type).toBe(RstNodeType.Paragraph)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].getTextContent()).toBe('definition')
})

test('1 classifier', () => {
    const input = `
        term : classifier 1
            definition
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.DefinitionList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.DefinitionListItem)
    expect((root.children[0].children[0] as DefinitionListItemNode).term.getTextContent()).toBe('term')
    expect((root.children[0].children[0] as DefinitionListItemNode).classifiers.length).toBe(1)
    expect((root.children[0].children[0] as DefinitionListItemNode).classifiers[0].getTextContent()).toBe('classifier 1')
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes.length).toBe(1)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].type).toBe(RstNodeType.Paragraph)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].getTextContent()).toBe('definition')
})

test('2 classifiers', () => {
    const input = `
        term : classifier 1 : classifier 2
            definition
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.DefinitionList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.DefinitionListItem)
    expect((root.children[0].children[0] as DefinitionListItemNode).term.getTextContent()).toBe('term')
    expect((root.children[0].children[0] as DefinitionListItemNode).classifiers.length).toBe(2)
    expect((root.children[0].children[0] as DefinitionListItemNode).classifiers[0].getTextContent()).toBe('classifier 1')
    expect((root.children[0].children[0] as DefinitionListItemNode).classifiers[1].getTextContent()).toBe('classifier 2')
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes.length).toBe(1)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].type).toBe(RstNodeType.Paragraph)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].getTextContent()).toBe('definition')
})

test('when classifier is not formated with space+colon+space, it is parsed as part of term', () => {
    const input = `
        term: not a classifier
            definition
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.DefinitionList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.DefinitionListItem)
    expect((root.children[0].children[0] as DefinitionListItemNode).term.getTextContent()).toBe('term: not a classifier')
    expect((root.children[0].children[0] as DefinitionListItemNode).classifiers.length).toBe(0)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes.length).toBe(1)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].type).toBe(RstNodeType.Paragraph)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].getTextContent()).toBe('definition')
})

test('when term starts with escape character, it is parsed as definition list instead of option list', () => {
    const input = `
        \\-term 5
            Without escaping, this would be an option list item.
    `
    const root = parseTestInput(input)

    expect(root.children.length).toBe(1)
    expect(root.children[0].type).toBe(RstNodeType.DefinitionList)
    expect(root.children[0].children.length).toBe(1)
    expect(root.children[0].children[0].type).toBe(RstNodeType.DefinitionListItem)
    expect((root.children[0].children[0] as DefinitionListItemNode).term.getTextContent()).toBe('\\-term 5')
    expect((root.children[0].children[0] as DefinitionListItemNode).classifiers.length).toBe(0)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes.length).toBe(1)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].type).toBe(RstNodeType.Paragraph)
    expect((root.children[0].children[0] as DefinitionListItemNode).defBodyNodes[0].getTextContent()).toBe('Without escaping, this would be an option list item.')
})
