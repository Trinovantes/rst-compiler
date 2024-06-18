import { createDirectiveGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { getImageInfo } from './getImageInfo.js'
import { createImgTagMd } from './createImgTagMd.js'
import { createImgTagHtml } from './createImgTagHtml.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

export const imageDirectiveGenerators = createDirectiveGenerators(
    [
        'image',
        'figure',
    ],

    (generatorState, node) => {
        const imgInfo = getImageInfo(generatorState, node)
        const imgTag = createImgTagHtml(imgInfo)

        switch (node.directive) {
            case 'image': {
                generatorState.writeLine(imgTag)
                break
            }

            case 'figure': {
                generatorState.writeLineHtmlTag('figure', node, () => {
                    generatorState.writeLine(imgTag)
                    if (node.children.length > 0) {
                        generatorState.writeLine()
                        generatorState.visitNodes(node.children)
                    }
                })
                break
            }

            default: {
                throw new Error(`Unhandled directive:"${node.directive}"`)
            }
        }
    },

    (generatorState, node) => {
        const imgInfo = getImageInfo(generatorState, node)
        const imgTag = createImgTagMd(imgInfo)

        generatorState.writeLine(imgTag)
        if (node.children.length > 0) {
            generatorState.writeLine()
            generatorState.visitNodes(node.children)
        }
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const imageDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        imageDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        for (const directive of imageDirectiveGenerators.directives) {
            parserOption.directivesWithInitContent.push(directive)
        }
    },
})
