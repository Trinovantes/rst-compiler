import { HtmlAttributeStore } from '../../Generator/HtmlAttributeStore.ts'
import type { RstGeneratorState } from '../../Generator/RstGeneratorState.ts'
import { RstDirective } from '../../RstNode/ExplicitMarkup/Directive.ts'
import { RstSubstitutionDef } from '../../RstNode/ExplicitMarkup/SubstitutionDef.ts'
import { urlRe, filePathRe } from '../../utils/parseEmbededRef.ts'

export function getImageInfo(generatorState: RstGeneratorState, node: RstDirective | RstSubstitutionDef) {
    let needHtmlTag = false
    const attrs = new HtmlAttributeStore()
    attrs.set('src', node.initContentText)

    for (const attrKey of ['alt', 'width', 'height', 'loading', 'class'] as const) {
        const attrValue = node.config?.getField(attrKey)
        if (!attrValue) {
            continue
        }

        needHtmlTag ||= (attrKey !== 'alt')
        attrs.set(attrKey, attrValue)
    }

    // If this <img> should be inside an <a> tag
    const targetUrl = (() => {
        const target = node.config?.getField('target')
        if (!target) {
            return null
        }

        if (urlRe.test(target) || filePathRe.test(target)) {
            return target
        }

        return generatorState.resolveNodeToUrl(node)
    })()

    return {
        attrs,
        targetUrl,
        needHtmlTag,
    }
}
