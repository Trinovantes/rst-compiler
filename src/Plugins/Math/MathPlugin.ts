import { HtmlAttributeStore } from '../../Generator/HtmlAttributeStore.ts'
import { createDirectiveGenerators, createInterpretedTextGenerators } from '../../Generator/RstGenerator.ts'
import { createRstCompilerPlugins } from '../../RstCompilerPlugin.ts'
import katex from 'katex'

const globalHeaderKey = 'katex'
const globalHeader = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css" integrity="sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib" crossorigin="anonymous">'

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
