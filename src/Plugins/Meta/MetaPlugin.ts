import { createDirectiveGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'
import { RstFieldListItem } from '@/RstNode/List/FieldListItem.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

export const metaDirectiveGenerators = createDirectiveGenerators(
    [
        'meta',
    ],

    (generatorState, node) => {
        generatorState.writeLineHtmlComment(node.toShortString())

        const metaInfos = getMetaInfo(node)
        if (metaInfos.length === 0) {
            return
        }

        const headerKey = `meta-${node.id}`
        let headerText = ''

        for (const metaInfo of metaInfos) {
            headerText += '<meta'

            for (const [attrKey, attrVal] of metaInfo.entries()) {
                headerText += ` ${attrKey}="${attrVal ?? ''}"`
            }

            headerText += '>\n'
        }

        generatorState.registerGlobalHeader(headerKey, headerText)
    },

    (generatorState, node) => {
        generatorState.writeLineMdComment(node.toShortString())

        const metaInfos = getMetaInfo(node)
        if (metaInfos.length === 0) {
            return
        }

        const headerKey = `meta-${node.id}`
        let headerText = ''

        headerText += '---\n'
        headerText += 'head:\n'

        for (const metaInfo of metaInfos) {
            headerText += '  - - meta\n'

            let isFirst = true
            for (const [attrKey, attrVal] of metaInfo.entries()) {
                if (isFirst) {
                    headerText += `    - ${attrKey}:`
                    isFirst = false
                } else {
                    headerText += `      ${attrKey}:`
                }

                if (attrVal) {
                    headerText += ` ${attrVal}`
                }

                headerText += '\n'
            }
        }

        headerText += '---\n'

        generatorState.registerGlobalHeader(headerKey, headerText)
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const metaDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        metaDirectiveGenerators,
    ],
})

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getMetaInfo(directiveNode: RstDirective) {
    const metaInfos = new Array<Map<string, string | null>>()

    for (const fieldListItem of directiveNode.config?.children ?? []) {
        if (!(fieldListItem instanceof RstFieldListItem)) {
            continue
        }

        const metaTagAttrs = new Map<string, string | null>()
        metaInfos.push(metaTagAttrs)

        const nameText = fieldListItem.nameText
        const metaNameEndIdx = nameText.search(' ') // Where the string of "name" attr of <meta> ends
        if (metaNameEndIdx >= 0) {
            // Additional attributes after first space
            metaTagAttrs.set('name', nameText.substring(0, metaNameEndIdx))
        } else if (!nameText.includes('=')) {
            // No additional attributes and no space in nameText so entire nameText is just the <meta> name attr
            metaTagAttrs.set('name', nameText)
        }

        if (nameText.includes('=')) {
            const attrRe = /(?: |^)(?<key>[\w-]+)(?:=(?<val>[\w-]+))?/g
            attrRe.lastIndex = metaNameEndIdx // Search nameText after where name attr ends

            while (attrRe.lastIndex < nameText.length) {
                const attrMatch = attrRe.exec(nameText)
                const key = attrMatch?.groups?.key
                if (!key) {
                    break
                }

                const val = attrMatch?.groups?.val ?? null
                metaTagAttrs.set(key, val)
            }
        }

        const contentText = fieldListItem.bodyText
        if (contentText) {
            metaTagAttrs.set('content', contentText)
        }
    }

    return metaInfos
}
