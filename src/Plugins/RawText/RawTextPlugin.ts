import { createDirectiveGenerators, createInterpretedTextGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

export const rawDirectiveGenerators = createDirectiveGenerators(
    [
        'raw',
    ],

    (generatorState, node) => {
        if (node.initContentText !== 'html') {
            return
        }

        generatorState.writeLine(node.rawBodyText)
    },

    (generatorState, node) => {
        if (!['html', 'md', 'markdown'].includes(node.initContentText)) {
            return
        }

        generatorState.writeLine(node.rawBodyText)
    },
)

// ----------------------------------------------------------------------------
// MARK: InterpretedText
// ----------------------------------------------------------------------------

export const rawInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'raw',
    ],

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(node.rawTextContent)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(node.rawTextContent)
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const rawTextPlugins = createRstCompilerPlugins({
    directiveGenerators: [
        rawDirectiveGenerators,
    ],

    interpretedTextGenerators: [
        rawInterpretedTextGenerators,
    ],

    onBeforeParse: (parserOption) => {
        for (const directive of rawDirectiveGenerators.directives) {
            parserOption.directivesWithRawText.push(directive)
            parserOption.directivesWithInitContent.push(directive)
        }
    },
})
