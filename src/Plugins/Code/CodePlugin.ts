import { createDirectiveGenerators, createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { sanitizeHtml } from '@/utils/sanitizeHtml.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'
import { renderCodeBlockHtml } from './renderCodeBlockHtml.js'
import { renderCodeBlockMd } from './renderCodeBlockMd.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

export const highlightDirectiveGenerators = createDirectiveGenerators(
    [
        'highlight',
    ],

    (generatorState, node) => {
        generatorState.opts.defaultSyntaxLanguage = node.initContentText
        generatorState.writeLineHtmlComment(node.toShortString())
    },

    (generatorState, node) => {
        generatorState.opts.defaultSyntaxLanguage = node.initContentText
        generatorState.writeLineMdComment(node.toShortString())
    },
)

export const codeDirectiveGenerators = createDirectiveGenerators(
    [
        'code',
        'code-block',
    ],

    (generatorState, node) => {
        const language = getCodeLanguage(node) ?? generatorState.opts.defaultSyntaxLanguage
        renderCodeBlockHtml(generatorState, language, node.rawBodyText, node)
    },

    (generatorState, node) => {
        const language = getCodeLanguage(node) ?? generatorState.opts.defaultSyntaxLanguage
        renderCodeBlockMd(generatorState, language, node.rawBodyText)
    },
)

// ----------------------------------------------------------------------------
// MARK: InterpretedText
// ----------------------------------------------------------------------------

export const codeInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'code',
        'mimetype',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<code>${sanitizeHtml(node.textContent)}</code>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`\`${node.textContent}\``) // Don't sanitize since this is written inside literal text
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const codePlugins = createRstCompilerPlugins({
    directiveGenerators: [
        highlightDirectiveGenerators,
        codeDirectiveGenerators,
    ],

    interpretedTextGenerators: [
        codeInterpretedTextGenerators,
    ],

    onBeforeParse: (parserOption) => {
        for (const directive of highlightDirectiveGenerators.directives) {
            parserOption.directivesWithInitContent.push(directive)
        }

        for (const directive of codeDirectiveGenerators.directives) {
            parserOption.directivesWithRawText.push(directive)
            parserOption.directivesWithInitContent.push(directive)
        }
    },
})

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getCodeLanguage(node: RstDirective): string | null {
    const language = node.initContentText
    if (!language) {
        return null
    }

    const isLanguageName = /^[a-z+]+$/.test(language)
    if (!isLanguageName) {
        return null
    }

    return language
}
