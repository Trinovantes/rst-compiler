import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import { createDirectiveGenerators } from '@/Generator/RstGenerator.js'
import { RstGeneratorError } from '@/Generator/RstGeneratorError.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

export const videoDirectiveGenerators = createDirectiveGenerators(
    [
        'video',
    ],

    (generatorState, node) => {
        const altText = node.config?.getField('alt')
        const htmlClass = node.config?.getField('class')
        const preloadSetting = node.config?.getField('preload')

        const enableMute = node.config?.hasField('muted')
        const enableControls = !node.config?.hasField('nocontrols')
        const enableAutoPlay = node.config?.hasField('autoplay')
        const enableLoop = node.config?.hasField('loop')

        const videoAttrs = new HtmlAttributeStore()
        if (htmlClass) {
            videoAttrs.set('class', htmlClass)
        }
        if (preloadSetting) {
            videoAttrs.set('preload', preloadSetting)
        }
        if (enableMute) {
            videoAttrs.set('muted', 'true')
        }
        if (enableControls) {
            videoAttrs.set('controls', 'true')
        }
        if (enableAutoPlay) {
            videoAttrs.set('autoplay', 'true')
        }
        if (enableLoop) {
            videoAttrs.set('loop', 'true')
        }

        generatorState.writeLineHtmlTagWithAttr('video', node, videoAttrs, () => {
            const videoUrl = node.initContentText
            const videoExt = /\.(?<videoExt>\w+)/.exec(videoUrl)?.groups?.videoExt
            if (!videoExt) {
                throw new RstGeneratorError(generatorState, node, 'Failed to get video extension')
            }

            const sourceAttrs = new HtmlAttributeStore()
            sourceAttrs.set('src', videoUrl)
            sourceAttrs.set('type', `video/${videoExt}`)

            generatorState.writeLineHtmlTagWithAttr('source', null, sourceAttrs)

            if (altText) {
                generatorState.writeLineHtmlTag('p', null, () => {
                    generatorState.writeLine(altText)
                })
            }
        })
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const videoDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        videoDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        for (const directive of videoDirectiveGenerators.directives) {
            parserOption.directivesWithInitContent.push(directive)
        }
    },
})
