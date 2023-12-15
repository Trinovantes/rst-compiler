import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('single line comment', () => {
    const input = `
        .. This is a comment
    `

    expectDocument(input, [
        {
            type: RstNodeType.Comment,
            text: 'This is a comment',
        },
    ])
})

test('multi line comment', () => {
    const input = `
        ..
            line 1
            line 2
    `

    expectDocument(input, [
        {
            type: RstNodeType.Comment,
            text: 'line 1\nline 2',
        },
    ])
})

test('when text is immediately after single line comment, it should not be part of original comment', () => {
    const input = `
        .. comment
           paragraph
    `

    expectDocument(input, [
        {
            type: RstNodeType.Comment,
            text: 'comment',
        },
        {
            type: RstNodeType.Paragraph,
            text: 'paragraph',
        },
    ])
})

test('when multi line comment has varying indentation sizes, it should strip every line to the max common indentation', () => {
    const input = `
        ..
             indent 5
            indent 4
           indent 3
    `

    expectDocument(input, [
        {
            type: RstNodeType.Comment,
            text: '  indent 5\n indent 4\nindent 3',
        },
    ])
})
