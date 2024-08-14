import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import { RstGeneratorState } from '@/Generator/RstGeneratorState.js'
import { RstNode } from '@/RstNode/RstNode.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'

export function renderCodeBlockHtml(generatorState: RstGeneratorState, language: string, rawCode: string, node: RstNode) {
    generatorState.writeLineHtmlTagWithAttrInSameLine('pre', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.codeBlock }), () => {
        if (!generatorState.opts.shiki) {
            generatorState.writeText(sanitizeHtml(rawCode))
            return
        }

        let renderedCode: string

        if (typeof generatorState.opts.shiki.theme === 'string') {
            renderedCode = generatorState.opts.shiki.highlighter.codeToHtml(rawCode, {
                lang: language,
                theme: generatorState.opts.shiki.theme,
                transformers: generatorState.opts.shiki.transformers,
            })
        } else {
            renderedCode = generatorState.opts.shiki.highlighter.codeToHtml(rawCode, {
                lang: language,
                themes: generatorState.opts.shiki.theme,
                transformers: generatorState.opts.shiki.transformers,
            })
        }

        generatorState.writeText(renderedCode)
    })
}
