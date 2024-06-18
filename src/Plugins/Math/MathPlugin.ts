import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'
import { createDirectiveGenerators, createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import katex from 'katex'

const globalHeaderKey = 'katex'
const globalHeader = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.css" integrity="sha384-wcIxkf4k558AjM3Yz3BBFQUbk/zgIYC2R0QpeeYb+TwlBVMrlgLqwRjRtGZiK7ww" crossorigin="anonymous">'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

const MATH_DIRECTIVE = 'math'

export const mathDirectiveGenerators = createDirectiveGenerators(
    [
        MATH_DIRECTIVE,
    ],

    (generatorState, node) => {
        generatorState.writeLineHtmlTagWithAttr('div', node, new HtmlAttributeStore({ class: generatorState.opts.htmlClass.mathBlock }), () => {
            const renderedMath = katex.renderToString(node.rawBodyText, generatorState.opts.katex?.opts)
            generatorState.writeLine(renderedMath)
            generatorState.registerGlobalHeader(globalHeaderKey, globalHeader)
        })
    },

    (generatorState, node) => {
        generatorState.writeLine('$$')
        generatorState.writeLine(node.rawBodyText)
        generatorState.writeLine('$$')
    },
)

// ----------------------------------------------------------------------------
// MARK: InterpretedText
// ----------------------------------------------------------------------------

const MATH_ROLE = 'math'

export const mathInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        MATH_ROLE,
    ],

    (generatorState, node) => {
        const renderedMath = katex.renderToString(node.rawTextContent)
        generatorState.writeTextWithLinePrefix(`<span class="${generatorState.opts.htmlClass.mathInline}">${renderedMath}</span>`)
        generatorState.registerGlobalHeader(globalHeaderKey, globalHeader)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`$${node.rawTextContent}$`)
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const mathPlugins = createRstCompilerPlugins({
    directiveGenerators: [
        mathDirectiveGenerators,
    ],

    interpretedTextGenerators: [
        mathInterpretedTextGenerators,
    ],

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithRawText.push(MATH_DIRECTIVE)
    },
})
