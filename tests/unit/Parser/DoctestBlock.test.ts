import { test } from 'vitest'
import { expectDocument } from '../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('doctest block', () => {
    const input = `
        >>> test
    `

    expectDocument(input, [
        {
            type: RstNodeType.DocktestBlock,
            text: '>>> test',
        },
    ])
})

test('when indented doctest is preceded by literal block marker, it is parsed as literal block instead', () => {
    const input = `
        The following is a literal block::
        
            >>> This is not recognized as a doctest block by reStructuredText
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'The following is a literal block:',
        },
        {
            type: RstNodeType.LiteralBlock,
            text: '>>> This is not recognized as a doctest block by reStructuredText',
        },
    ])
})

test('when indented doctest is not preceded by literal block marker, it is parsed as doctest inside a blockquote', () => {
    const input = `
        paragraph
        
            >>> test
    `

    expectDocument(input, [
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
        {
            type: RstNodeType.Blockquote,
            children: [
                {
                    type: RstNodeType.DocktestBlock,
                    text: '>>> test',
                },
            ],
        },
    ])
})
