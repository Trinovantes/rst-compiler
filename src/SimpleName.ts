import { Brand } from '@/@types/Brand.js'

export const simpleNameReStr = '(?:[a-zA-Z](?:-?[a-zA-Z0-9]+)*)'

/**
 * Reference Name (called SimpleName in this project to avoid confusion with *Ref RstNodes)
 *
 * For cross-referencing elements (usually set as "id" attr of html tags)
 * https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#reference-names
 *
 *  For (case-insensitive):
 * - Footnote label
 * - Citation label
 * - InterpretedText role
 *
 * Also for (in another namespace but is case-sensitive):
 * - SubstitutionDef label
 * - SubstitutionRef label
 */
export type SimpleName = Brand<string, 'SimpleName'>

/**
 * This function converts origName to normalized form for cross-referencing between documents and for output
 *
 * Note:
 *      This function is slightly more strict than internal name normalization
 *      For internal names, the specs allow some other non-alphanumeric characters e.g. "some:text"
 *      However for external names, the normalization is more strict i.e. this function
 *      To keep things simple and to avoid having two normalized forms, we just normalize to this final form
 */
export function normalizeSimpleName(origName: string): SimpleName {
    // 1. Accented characters to base character
    origName = origName.normalize('NFD').replaceAll(/[\u0300-\u036f]/g, '')

    // 2. Lowercase all letters
    origName = origName.toLowerCase()

    // 3. Non-alphanumeric characters to hyphens
    origName = origName.replaceAll(/[^a-zA-Z0-9]/g, '-')

    // 4. Consequtive hyphens to one hyphen
    origName = origName.replaceAll(/-{2,}/g, '-')

    // 5. Strip leading hyphens/numbers
    origName = origName.replace(/^[-\d]*/, '')

    // 6. Strip trailing hyphens
    origName = origName.replace(/-*$/, '')

    return origName as SimpleName
}

export function isSimpleName(text: string): text is SimpleName {
    return new RegExp(`^${simpleNameReStr}$`).test(text)
}
