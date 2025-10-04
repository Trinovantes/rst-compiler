import { createDirectiveGenerators } from '../../Generator/RstGenerator.ts'
import { createRstCompilerPlugins } from '../../RstCompilerPlugin.ts'
import { getImageInfo } from './getImageInfo.ts'
import { createImgTagMd } from './createImgTagMd.ts'
import { createImgTagHtml } from './createImgTagHtml.ts'
import { RstGeneratorError } from '../../Generator/RstGeneratorError.ts'

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
                throw new RstGeneratorError(generatorState, node, `Unhandled directive:"${node.directive}"`)
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
