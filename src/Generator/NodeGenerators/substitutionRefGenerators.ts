import { format } from 'date-fns'
import { createImgTagHtml } from '../../Plugins/Image/createImgTagHtml.js'
import { createImgTagMd } from '../../Plugins/Image/createImgTagMd.js'
import { getImageInfo } from '../../Plugins/Image/getImageInfo.js'
import { createNodeGenerators } from '../RstGenerator.js'
import { RstGeneratorError } from '../RstGeneratorError.js'

export const substitutionRefGenerators = createNodeGenerators(
    'SubstitutionRef',

    (generatorState, node) => {
        const substitutionDef = generatorState.substitutionResolver.resolveSubstitution(generatorState, node)
        const replacementText = generatorState.getChildrenText(() => {
            if (substitutionDef.children.length < 1) {
                return
            }

            // First child is the replacement text of the substitution
            // Other children (if any) customizes the substitution e.g. FieldList contains options for editing the replacementText
            generatorState.visitNodes(substitutionDef.children[0].children)
        })

        switch (substitutionDef.directive) {
            case 'image': {
                const imgInfo = getImageInfo(generatorState, substitutionDef)
                if (!imgInfo.attrs.has('alt')) {
                    imgInfo.attrs.set('alt', node.textContent)
                }

                const imgTag = createImgTagHtml(imgInfo)
                generatorState.writeText(imgTag)
                break
            }

            case 'replace': {
                generatorState.writeText(replacementText)
                break
            }

            case 'unicode': {
                generatorState.useUnicodeConversion(() => {
                    generatorState.writeText(replacementText)
                })
                break
            }

            case 'date': {
                const dateStr = format(new Date(), replacementText || generatorState.opts.substitutionDateFormat)
                generatorState.writeText(dateStr)
                break
            }

            default: {
                throw new RstGeneratorError(generatorState, substitutionDef, 'Unhandled directive')
            }
        }
    },

    (generatorState, node) => {
        const substitutionDef = generatorState.substitutionResolver.resolveSubstitution(generatorState, node)
        const replacementText = generatorState.getChildrenText(() => {
            if (substitutionDef.children.length < 1) {
                return
            }

            // First child is the replacement text of the substitution
            // Other children (if any) customizes the substitution e.g. FieldList contains options for editing the replacementText
            generatorState.visitNodes(substitutionDef.children[0].children)
        })

        switch (substitutionDef.directive) {
            case 'image': {
                const imgInfo = getImageInfo(generatorState, substitutionDef)
                if (!imgInfo.attrs.has('alt')) {
                    imgInfo.attrs.set('alt', node.textContent)
                }

                const imgTag = createImgTagMd(imgInfo)
                generatorState.writeText(imgTag)
                break
            }

            case 'replace': {
                generatorState.writeText(replacementText)
                break
            }

            case 'unicode': {
                generatorState.useUnicodeConversion(() => {
                    generatorState.writeText(replacementText)
                })
                break
            }

            case 'date': {
                const dateStr = format(new Date(), replacementText || generatorState.opts.substitutionDateFormat)
                generatorState.writeText(dateStr)
                break
            }

            default: {
                throw new RstGeneratorError(generatorState, substitutionDef, 'Unhandled directive')
            }
        }
    },
)
