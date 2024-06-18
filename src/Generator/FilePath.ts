import { Brand } from '@/@types/Brand.js'
import path from 'node:path'

export type FilePathWithoutRst = Brand<string, 'FilePathWithoutRst'>

// ----------------------------------------------------------------------------
// MARK: node:path Wrappers
// ----------------------------------------------------------------------------

export function normalizeFilePath(filePath: string): string {
    return path.normalize(filePath)
}

export function joinFilePath(basePath: FilePathWithoutRst, ...args: Array<string>): string {
    return normalizeFilePath(path.join(basePath, ...args))
}

export function resolveFilePath(srcFilePath: FilePathWithoutRst, ...args: Array<string>): string {
    const srcFileDir = path.dirname(srcFilePath)
    return normalizeFilePath(path.resolve(srcFileDir, ...args))
}

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

export function getFilePathWithoutRst(filePath: string): FilePathWithoutRst {
    const pathWithoutExt = /^(?<pathWithoutExt>.+?)(?:\.rst)?$/.exec(filePath)?.groups?.pathWithoutExt ?? filePath
    return pathWithoutExt as FilePathWithoutRst
}
