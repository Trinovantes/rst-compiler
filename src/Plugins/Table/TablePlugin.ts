import { createDirectiveGenerators } from '@/Generator/RstGenerator.js'
import { RstGeneratorState } from '@/Generator/RstGeneratorState.js'
import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'
import { RstBulletList } from '@/RstNode/List/BulletList.js'
import { RstTable, listTableGenerators, tableGenerators } from '@/RstNode/Table/Table.js'
import { assertNode } from '@/utils/assertNode.js'

// ----------------------------------------------------------------------------
// MARK: Directive
// ----------------------------------------------------------------------------

const TABLE_DIRECTIVE = 'table'

export const tableDirectiveGenerators = createDirectiveGenerators(
    [
        TABLE_DIRECTIVE,
    ],

    (generatorState, node) => {
        const table = getTableNode(generatorState, node)
        tableGenerators.htmlGenerator.generate(generatorState, table, node)
    },

    (generatorState, node) => {
        const table = getTableNode(generatorState, node)
        tableGenerators.mdGenerator.generate(generatorState, table, node)
    },
)

const LIST_TABLE_DIRECTIVE = 'list-table'

export const listTableDirectiveGenerators = createDirectiveGenerators(
    [
        LIST_TABLE_DIRECTIVE,
    ],

    (generatorState, node) => {
        const list = getListTableNode(generatorState, node)
        listTableGenerators.htmlGenerator.generate(generatorState, list, node)
    },

    (generatorState, node) => {
        const list = getListTableNode(generatorState, node)
        listTableGenerators.mdGenerator.generate(generatorState, list, node)
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const tableDirectivePlugin = createRstCompilerPlugins({
    directiveGenerators: [
        tableDirectiveGenerators,
        listTableDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithInitContent.push(TABLE_DIRECTIVE)
        parserOption.directivesWithInitContent.push(LIST_TABLE_DIRECTIVE)
    },
})

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getTableNode(generatorState: RstGeneratorState, directiveNode: RstDirective): RstTable {
    assertNode(generatorState, directiveNode, 'Directive', 1)

    const table = directiveNode.children[0]
    assertNode(generatorState, table, 'Table')

    return table
}

function getListTableNode(generatorState: RstGeneratorState, directiveNode: RstDirective): RstBulletList {
    assertNode(generatorState, directiveNode, 'Directive', 1)

    const list = directiveNode.children[0]
    assertNode(generatorState, list, 'BulletList')

    return list
}
