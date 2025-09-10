import { parseCsv } from '../../../src/utils/parseCsv.js'
import { trimCommonIndent } from '../../../src/utils/trimCommonIndent.js'
import { expect, test } from 'vitest'

test.each([
    {
        input: 'a,b,c',
        output: [
            ['a', 'b', 'c'],
        ],
    },
    {
        input: '"a",b,c',
        output: [
            ['a', 'b', 'c'],
        ],
    },
    {
        input: 'a,"b",c',
        output: [
            ['a', 'b', 'c'],
        ],
    },
    {
        input: 'a,b,"c"',
        output: [
            ['a', 'b', 'c'],
        ],
    },
    {
        input: '"a","b","c"',
        output: [
            ['a', 'b', 'c'],
        ],
    },
    {
        input: '"""a""",b,c',
        output: [
            ['"a"', 'b', 'c'],
        ],
    },
    {
        input: trimCommonIndent(`
            "Albatross", 2.99, "On a stick!"
            "Crunchy Frog", 1.49, "If we took the bones out,
            it wouldn't be crunchy, now would it?"
            "Gannet Ripple", 1.99, "On a stick!"
        `),
        output: [
            ['Albatross', '2.99', 'On a stick!'],
            ['Crunchy Frog', '1.49', `If we took the bones out,\nit wouldn't be crunchy, now would it?`],
            ['Gannet Ripple', '1.99', 'On a stick!'],
        ],
    },
])('parse $input', ({ input, output }) => {
    expect(parseCsv(input)).toEqual(output)
})
