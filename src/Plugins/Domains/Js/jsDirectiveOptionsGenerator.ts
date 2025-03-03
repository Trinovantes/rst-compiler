import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { getJsPropGroups, getJsPropGroupLabel, renderPropGroupAsHtml } from './JsPropGroup.js'

export const jsDirectiveOptionsGenerator = createNodeGenerators(
    'FieldList',

    (generatorState, node) => {
        const jsProps = getJsPropGroups(generatorState, node)

        generatorState.writeLineHtmlTag('dl', node, () => {
            for (const [propType, propGroups] of jsProps.entries()) {
                generatorState.writeLineHtmlTag('dt', null, () => {
                    const groupLabel = getJsPropGroupLabel(propType)
                    generatorState.writeLine(groupLabel)
                })

                generatorState.writeLineHtmlTag('dd', null, () => {
                    if (propGroups.length === 1) {
                        renderPropGroupAsHtml(generatorState, propGroups[0])
                    } else {
                        generatorState.writeLineHtmlTag('ul', null, () => {
                            for (const propGroup of propGroups) {
                                generatorState.writeLineHtmlTag('li', node, () => {
                                    renderPropGroupAsHtml(generatorState, propGroup)
                                })
                            }
                        })
                    }
                })
            }
        })
    },
)
