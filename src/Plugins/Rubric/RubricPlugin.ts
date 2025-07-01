import { createDirectiveGenerators } from '@/Generator/RstGenerator.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

const RUBRIC_DIRECTIVE = 'rubric'

export const rubricDirectiveGenerators = createDirectiveGenerators(
    [
        RUBRIC_DIRECTIVE,
    ],

    (generatorState, node) => {
        const level = getRubricLevel(node)

        generatorState.writeLineHtmlTag(`h${level}`, node, () => {
            generatorState.writeLineVisitor(() => {
                generatorState.writeText(node.initContentText)
            })
        })
    },

    (generatorState, node) => {
        const level = getRubricLevel(node)

        generatorState.writeLineVisitor(() => {
            generatorState.writeText('#'.repeat(level))
            generatorState.writeText(' ')
            generatorState.writeText(node.initContentText)
        })
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const rubricDirectivePlugin = createRstCompilerPlugins({
    directiveGenerators: [
        rubricDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithInitContent.push(RUBRIC_DIRECTIVE)
    },
})

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getRubricLevel(directiveNode: RstDirective): number {
    const levelStr = directiveNode.config?.getField('heading-level')
    if (!levelStr) {
        return 1
    }

    const level = parseInt(levelStr)
    if (isNaN(level)) {
        return 1
    }

    return level
}
