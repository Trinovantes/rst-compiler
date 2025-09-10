import type { Brand } from '../@types/Brand.js'

export type FilePathWithoutRst = Brand<string, 'FilePathWithoutRst'>

export function getFilePathWithoutRst(filePath: string): FilePathWithoutRst {
    const pathWithoutExt = /^(?<pathWithoutExt>.+?)(?:\.rst)?$/.exec(filePath)?.groups?.pathWithoutExt ?? filePath
    return pathWithoutExt as FilePathWithoutRst
}
