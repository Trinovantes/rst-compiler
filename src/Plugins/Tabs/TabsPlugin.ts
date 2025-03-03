import { createDirectiveGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { normalizeSimpleName } from '@/SimpleName.js'
import { RstGeneratorState } from '@/Generator/RstGeneratorState.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import browserCode from './Tabs.browser.js?raw' with { type: 'text' }
import { renderCodeBlockHtml } from '../Code/renderCodeBlockHtml.js'
import { renderCodeBlockMd } from '../Code/renderCodeBlockMd.js'
import { bundledLanguagesInfo } from 'shiki'
import { assertNode } from '@/utils/assertNode.js'
import { RstGeneratorError } from '@/Generator/RstGeneratorError.js'

// ----------------------------------------------------------------------------
// MARK: Constants
// ----------------------------------------------------------------------------

export const TAB_CONTAINER_DIRECTIVE = 'tabs'
export const TAB_PANEL_DIRECTIVE = 'tab'
export const TAB_PANEL_GROUP_DIRECTIVE = 'group-tab'
export const TAB_PANEL_CODEGROUP_DIRECTIVE = 'code-tab'

export const GENERATOR_GLOBAL_HEADER_KEY = 'tabs-plugin'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TabsClientConstant = Object.freeze({
    ELEMENT_CONTAINER: 'rst-tabs-container',
    ELEMENT_HEADING: 'rst-tab-heading',
    ELEMENT_PANEL: 'rst-tab-panel',

    TEMPLATE_SLOT_NAME_HEADING: 'heading',
    TEMPLATE_SLOT_NAME_PANEL: 'panel',

    ATTR_TAB_GROUP_NAME: 'data-group-name',
    ATTR_HEADING_NAME: 'data-heading',

    LOCAL_STORAGE_KEY: 'rst-compiler:tabs-plugin',
})

// ----------------------------------------------------------------------------
// MARK: Container Directive
// ----------------------------------------------------------------------------

export const tabContainerDirectiveGenerators = createDirectiveGenerators(
    [
        TAB_CONTAINER_DIRECTIVE,
    ],

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore()
        attrs.append(TabsClientConstant.ATTR_TAB_GROUP_NAME, getTabsGroupKey(generatorState, node))

        generatorState.registerGlobalHeader(GENERATOR_GLOBAL_HEADER_KEY, getTabsClientScript())
        generatorState.writeLineHtmlTagWithAttr(TabsClientConstant.ELEMENT_CONTAINER, node, attrs, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        const groupKey = getTabsGroupKey(generatorState, node)
        const containerLabel = groupKey
            ? `tabs key:${groupKey}`
            : 'tabs'

        generatorState.writeLineMdContainer(containerLabel, node, () => {
            generatorState.useNoLineBreaksBetweenBlocks(() => {
                generatorState.visitNodes(node.children)
            })
        })
    },
)

function getTabsGroupKey(generatorState: RstGeneratorState, node: RstDirective): string {
    let childrenDirective: string | null = null

    for (const child of node.children) {
        assertNode(generatorState, child, 'Directive')

        if (childrenDirective !== null && childrenDirective !== child.directive) {
            throw new RstGeneratorError(generatorState, child, `Expected "${childrenDirective}" but got "${child.directive}"`)
        }

        childrenDirective = child.directive
    }

    if (!childrenDirective) {
        throw new RstGeneratorError(generatorState, node, 'Failed to get childrenDirective')
    }

    switch (childrenDirective) {
        case TAB_PANEL_DIRECTIVE:
            return '' // No key needed for ungrouped tabs

        case TAB_PANEL_GROUP_DIRECTIVE:
            return TAB_PANEL_GROUP_DIRECTIVE

        case TAB_PANEL_CODEGROUP_DIRECTIVE:
            return TAB_PANEL_CODEGROUP_DIRECTIVE

        default:
            throw new RstGeneratorError(generatorState, node, `Unexpected directive:"${childrenDirective}"`)
    }
}

// ----------------------------------------------------------------------------
// MARK: Panel Directive
// ----------------------------------------------------------------------------

export const tabPanelDirectiveGenerators = createDirectiveGenerators(
    [
        TAB_PANEL_DIRECTIVE,
        TAB_PANEL_GROUP_DIRECTIVE,
    ],

    (generatorState, node) => {
        const headingAttrs = new HtmlAttributeStore()
        headingAttrs.set('role', 'heading') // This will be dynamically changed by js later. When js is disabled, this role is more relevant in the static markup
        headingAttrs.set('slot', TabsClientConstant.TEMPLATE_SLOT_NAME_HEADING)
        headingAttrs.set(TabsClientConstant.ATTR_HEADING_NAME, normalizeSimpleName(node.initContentText))

        const panelAttrs = new HtmlAttributeStore()
        panelAttrs.set('role', 'region') // This will be dynamically changed by js later. When js is disabled, this role is more relevant in the static markup
        panelAttrs.set('slot', TabsClientConstant.TEMPLATE_SLOT_NAME_PANEL)

        generatorState.writeLineHtmlTagWithAttr(TabsClientConstant.ELEMENT_HEADING, null, headingAttrs, () => {
            generatorState.writeLine(node.initContentText)
        })

        generatorState.writeLineHtmlTagWithAttr(TabsClientConstant.ELEMENT_PANEL, null, panelAttrs, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.writeLine(`== ${node.initContentText}`)
        generatorState.visitNodes(node.children)
    },
)

export const tabPanelCodeDirectiveGenerators = createDirectiveGenerators(
    [
        TAB_PANEL_CODEGROUP_DIRECTIVE,
    ],

    (generatorState, node) => {
        const { label, language } = getCodeTabInfo(node)

        const headingAttrs = new HtmlAttributeStore()
        headingAttrs.set('role', 'heading') // This will be dynamically changed by js later. When js is disabled, this role is more relevant in the static markup
        headingAttrs.set('slot', TabsClientConstant.TEMPLATE_SLOT_NAME_HEADING)
        headingAttrs.set(TabsClientConstant.ATTR_HEADING_NAME, normalizeSimpleName(label))

        const panelAttrs = new HtmlAttributeStore()
        panelAttrs.set('role', 'region') // This will be dynamically changed by js later. When js is disabled, this role is more relevant in the static markup
        panelAttrs.set('slot', TabsClientConstant.TEMPLATE_SLOT_NAME_PANEL)

        generatorState.writeLineHtmlTagWithAttr(TabsClientConstant.ELEMENT_HEADING, null, headingAttrs, () => {
            generatorState.writeLine(label)
        })

        generatorState.writeLineHtmlTagWithAttr(TabsClientConstant.ELEMENT_PANEL, null, panelAttrs, () => {
            renderCodeBlockHtml(generatorState, language, node.rawBodyText, node)
        })
    },

    (generatorState, node) => {
        const { label, language } = getCodeTabInfo(node)
        generatorState.writeLine(`== ${label}`)
        renderCodeBlockMd(generatorState, language, node.rawBodyText)
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const tabsDirectivePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        tabContainerDirectiveGenerators,
        tabPanelDirectiveGenerators,
        tabPanelCodeDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithRawText.push(TAB_PANEL_CODEGROUP_DIRECTIVE)
        parserOption.directivesWithInitContent.push(TAB_PANEL_DIRECTIVE)
        parserOption.directivesWithInitContent.push(TAB_PANEL_GROUP_DIRECTIVE)
        parserOption.directivesWithInitContent.push(TAB_PANEL_CODEGROUP_DIRECTIVE)
    },

    onBeforeGenerate: (generatorOptions) => {
        generatorOptions.directivesWillOutputMdContainers.push(TAB_CONTAINER_DIRECTIVE)
    },
})

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getCodeTabInfo(node: RstDirective) {
    const origLabel = node.initContentText
    const idxOfFirstSpace = origLabel.indexOf(' ')
    const languageCandidate = idxOfFirstSpace >= 0
        ? origLabel.substring(0, idxOfFirstSpace)
        : origLabel

    for (const languageInfo of bundledLanguagesInfo) {
        if (languageInfo.id === languageCandidate || languageInfo.aliases?.includes(languageCandidate)) {
            return {
                language: languageCandidate,
                label: idxOfFirstSpace >= 0
                    ? origLabel.substring(idxOfFirstSpace + 1)
                    : languageInfo.name,
            }
        }
    }

    return {
        language: 'txt',
        label: origLabel,
    }
}

function getTabsClientScript() {
    let output = `
<script type="text/javascript">
(() => {
${browserCode}
})()
</script>
    `

    for (const [origText, replacement] of Object.entries(TabsClientConstant)) {
        output = output.replaceAll(origText, replacement)
    }

    return output
}
