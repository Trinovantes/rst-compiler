import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test.only('simple table', () => {
    const input = `
        =====  =====
        col 1  col 2
        test   test
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
        },
    ])
})

test('simple table must have at least 2 columns, otherwise it will be parsed as section', () => {
    const input = `
        =====
        col 1
        test
        =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
        },
    ])
})

test('simple table with header separator', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
        test   test
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
        },
    ])
})

test('when there is a line break after header separator, it breaks stops the table parsing after the header', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====

        test   test
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
        },
    ])
})

test('TODO', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
               test
        test   test
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
        },
    ])
})

test('simple table with empty cell not in first column', () => {
    const input = `
        =====  =====
        col 1  col 2
        test
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
        },
    ])
})

test('when there is an empty cell in first column, it should not be a new row', () => {
    const input = `
        =====  =====
        col 1  col 2
        test
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
        },
    ])
})
