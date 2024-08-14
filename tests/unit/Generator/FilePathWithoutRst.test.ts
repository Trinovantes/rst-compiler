import { getFilePathWithoutRst } from '@/Generator/FilePathWithoutRst.js'
import { expect, test } from 'vitest'

test('when file path includes rst file extension, it removes the extension', () => {
    const input = '/hello/world/mydoc.rst'
    const output = '/hello/world/mydoc'
    expect(getFilePathWithoutRst(input)).toBe(output)
})

test('when file path does not include rst file extension, it returns the original string', () => {
    const input = '/hello/world/mydoc'
    expect(getFilePathWithoutRst(input)).toBe(input)
})
