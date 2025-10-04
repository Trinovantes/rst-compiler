import type { Brand } from '../../../@types/Brand.ts'
import { RstGeneratorError } from '../../../Generator/RstGeneratorError.ts'
import { RstGeneratorState } from '../../../Generator/RstGeneratorState.ts'
import { RstParagraph } from '../../../RstNode/Block/Paragraph.ts'
import { RstFieldList } from '../../../RstNode/List/FieldList.ts'
import { RstFieldListItem } from '../../../RstNode/List/FieldListItem.ts'
import { normalizeSimpleName } from '../../../SimpleName.ts'
import { assertNode } from '../../../utils/assertNode.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

export type JsPropGroupType = Brand<string, 'JsPropGroupType'> // "param", "throw", "return", etc.

export type JsPropGroup = {
    node: RstFieldListItem
    propDataType?: string
    propName?: string
}

export function getJsPropGroups(generatorState: RstGeneratorState, fieldList: RstFieldList): Map<JsPropGroupType, Array<JsPropGroup>> {
    const jsProps = new Map<JsPropGroupType, Array<JsPropGroup>>() // Maps prop type ("param", "throw", "return") to corresponding FieldListItems that describe them

    for (const fieldListItem of fieldList.children) {
        assertNode(generatorState, fieldListItem, 'FieldListItem')

        const fieldName = fieldListItem.name.map((textNode) => textNode.textContent).join(' ')
        const fieldNameParts = fieldName.split(' ')

        const propType = fieldNameParts[0] as JsPropGroupType
        if (!jsProps.has(propType)) {
            jsProps.set(propType, [])
        }

        switch (fieldNameParts.length) {
            case 1: {
                jsProps.get(propType)?.push({
                    node: fieldListItem,
                })
                break
            }

            case 2: {
                if (propType === 'param') {
                    jsProps.get(propType)?.push({
                        node: fieldListItem,
                        propName: fieldNameParts[1],
                    })
                } else {
                    jsProps.get(propType)?.push({
                        node: fieldListItem,
                        propDataType: fieldNameParts[1],
                    })
                }
                break
            }

            case 3: {
                jsProps.get(propType)?.push({
                    node: fieldListItem,
                    propDataType: fieldNameParts[1],
                    propName: fieldNameParts[2],
                })
                break
            }

            default:
                throw new RstGeneratorError(generatorState, fieldListItem, `Unhandled fieldName:"${fieldName}"`)
        }
    }

    return jsProps
}

export function getJsPropGroupLabel(groupType: JsPropGroupType): string {
    switch (groupType) {
        case 'param':
            return 'Arguments'

        case 'rtype':
            return 'Return Type'

        default:
            return groupType[0].toUpperCase() + groupType.substring(1)
    }
}

export function renderPropGroupAsHtml(generatorState: RstGeneratorState, propGroup: JsPropGroup): void {
    const { node: fieldListItem, propName, propDataType } = propGroup
    const isSingleLineDesc = fieldListItem.body.length === 1 && fieldListItem.body[0] instanceof RstParagraph

    const propNameText = ((): string => {
        if (!propName) {
            return ''
        }

        let output = ''
        output += '<strong>'
        output += sanitizeHtml(propName)

        if (propDataType) {
            const jsRefSimpleName = normalizeSimpleName(`js-${propDataType}`)

            let propDataTypeHtml: string

            // Check if jsRef defined by propDataType exists, if it does link to it otherwise render it as plain code
            if (generatorState.canResolveExternalRef(jsRefSimpleName)) {
                const externalRef = generatorState.resolveExternalRef(propGroup.node, jsRefSimpleName)
                propDataTypeHtml = `<a href="${externalRef.externalUrl}">${sanitizeHtml(externalRef.externalLabel ?? propDataType)}</a>`
            } else {
                propDataTypeHtml = `<code>${sanitizeHtml(propDataType)}</code>`
            }

            output += ` (${propDataTypeHtml})`
        }

        output += '</strong>'
        output += ' '

        if (isSingleLineDesc) {
            output += '&mdash;'
        }

        return output
    })()

    if (isSingleLineDesc) {
        const descText = generatorState.getChildrenText(() => {
            generatorState.visitNodes(fieldListItem.body[0].children)
        })

        generatorState.writeLine(propNameText + ' ' + descText)
    } else {
        generatorState.writeLineHtmlTag('p', null, () => {
            generatorState.writeText(propNameText)
        })

        generatorState.visitNodes(fieldListItem.body)
    }
}
