import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('internal hyperlink target', () => {
    const input = `
        .. _label:
    `

    expectDocument(input, [
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                label: 'label',
                isInternal: true,
            },
        },
    ])
})

test('anonymous hyperlink target', () => {
    const input = `
        .. __:
    `

    expectDocument(input, [
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                isAnonymous: true,
                isInternal: true,
            },
        },
    ])
})

test('anonymous hyperlink target (short form)', () => {
    const input = `
        __ link
    `

    expectDocument(input, [
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                isAnonymous: true,
                link: 'link',
            },
        },
    ])
})

test('external hyperlink target', () => {
    const input = `
        .. _label: https://google.ca
    `

    expectDocument(input, [
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                label: 'label',
                link: 'https://google.ca',
            },
        },
    ])
})

test('external hyperlink target in multiple lines', () => {
    const input = `
        .. _label: https://google.ca
           /really
           /long
           /link
    `

    expectDocument(input, [
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                label: 'label',
                link: 'https://google.ca/really/long/link',
            },
        },
    ])
})

test('indirect hyperlink target', () => {
    const input = `
        .. _one: two_
        .. _two: three_
        .. _three:
    `

    expectDocument(input, [
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                label: 'one',
                link: 'two_',
            },
        },
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                label: 'two',
                link: 'three_',
            },
        },
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                label: 'three',
                isInternal: true,
            },
        },
    ])
})

test('label containing colons', () => {
    const input = `
        .. _\`FAQTS: Computers: Programming: Languages: Python\`:
           http://python.faqts.com/
    `

    expectDocument(input, [
        {
            type: RstNodeType.HyperLinkTarget,
            meta: {
                label: 'FAQTS: Computers: Programming: Languages: Python',
                link: 'http://python.faqts.com/',
            },
        },
    ])
})
