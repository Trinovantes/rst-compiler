import { expect, test, describe } from 'vitest'
import { getPathDirname, joinFilePath, resolveFilePath } from '@/utils/path.js'

// ----------------------------------------------------------------------------
// MARK: getPathDirname
// ----------------------------------------------------------------------------

describe('getPathDirname', () => {
    test.each([
        ['/a/b/', '/a'],
        ['/a/b', '/a'],
        ['/a', '/'],
        ['', '.'],
        ['/', '/'],
        ['////', '/'],
        ['//a', '//'],
        ['a', '.'],
    ])('"%s" dirname = "%s"', (input, expectedOutput) => {
        expect(getPathDirname(input)).toBe(expectedOutput)
    })
})

// ----------------------------------------------------------------------------
// MARK: joinFilePath
// ----------------------------------------------------------------------------

describe('joinFilePath', () => {
    test.each([
        [['.', 'x/b', '..', '/b/c.js'], 'x/b/c.js'],
        [[], '.'],
        [['/.', 'x/b', '..', '/b/c.js'], '/x/b/c.js'],
        [['/foo', '../../../bar'], '/bar'],
        [['foo', '../../../bar'], '../../bar'],
        [['foo/', '../../../bar'], '../../bar'],
        [['foo/x', '../../../bar'], '../bar'],
        [['foo/x', './bar'], 'foo/x/bar'],
        [['foo/x/', './bar'], 'foo/x/bar'],
        [['foo/x/', '.', 'bar'], 'foo/x/bar'],
        [['./'], './'],
        [['.', './'], './'],
        [['.', '.', '.'], '.'],
        [['.', './', '.'], '.'],
        [['.', '/./', '.'], '.'],
        [['.', '/////./', '.'], '.'],
        [['.'], '.'],
        [['', '.'], '.'],
        [['', 'foo'], 'foo'],
        [['foo', '/bar'], 'foo/bar'],
        [['', '/foo'], '/foo'],
        [['', '', '/foo'], '/foo'],
        [['', '', 'foo'], 'foo'],
        [['foo', ''], 'foo'],
        [['foo/', ''], 'foo/'],
        [['foo', '', '/bar'], 'foo/bar'],
        [['./', '..', '/foo'], '../foo'],
        [['./', '..', '..', '/foo'], '../../foo'],
        [['.', '..', '..', '/foo'], '../../foo'],
        [['', '..', '..', '/foo'], '../../foo'],
        [['/'], '/'],
        [['/', '.'], '/'],
        [['/', '..'], '/'],
        [['/', '..', '..'], '/'],
        [[''], '.'],
        [['', ''], '.'],
        [[' /foo'], ' /foo'],
        [[' ', 'foo'], ' /foo'],
        [[' ', '.'], ' '],
        [[' ', '/'], ' /'],
        [[' ', ''], ' '],
        [['/', 'foo'], '/foo'],
        [['/', '/foo'], '/foo'],
        [['/', '//foo'], '/foo'],
        [['/', '', '/foo'], '/foo'],
        [['', '/', 'foo'], '/foo'],
        [['', '/', '/foo'], '/foo'],
    ])('%s joins to "%s"', (input, expectedOutput) => {
        expect(joinFilePath(...input)).toBe(expectedOutput)
    })
})

// ----------------------------------------------------------------------------
// MARK: resolveFilePath
// ----------------------------------------------------------------------------

describe('resolveFilePath', () => {
    test.each([
        [['/var/lib', '../', 'file/'], '/var/file'],
        [['/var/lib', '/../', 'file/'], '/file'],
        [['a/b/c/', '../../..'], '.'],
        [['.'], '.'],
        [['/some/dir', '.', '/absolute/'], '/absolute'],
        [['/foo/tmp.3/', '../tmp.3/cycles/root.js'], '/foo/tmp.3/cycles/root.js'],
    ])('%s resolves to "%s"', (input, expectedOutput) => {
        expect(resolveFilePath(...input)).toBe(expectedOutput)
    })
})
