import { test } from 'vitest'
import { expectDocument } from '../../../fixtures/expectDocument.js'
import { RstNodeType } from '@/Parser/RstNode.js'

test('simple table', () => {
    const input = `
        =====  =====
        col 1  col 2
        =====  =====
        1      Second column of row 1.
        2      Second column of row 2.
               Second line of paragraph.
        3      - Second column of row 3.

               - Second item in bullet
                 list (row 3, column 2).
        \\      Row 4; column 1 will be empty.
        =====  =====
    `

    expectDocument(input, [
        {
            type: RstNodeType.Table,
        },
    ])
})
