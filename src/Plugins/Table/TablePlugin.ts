import { tableGenerators, listTableGenerators, csvTableGenerators } from '../../Generator/NodeGenerators/tableGenerators.ts'
import { createDirectiveGenerators } from '../../Generator/RstGenerator.ts'
import type { RstGeneratorState } from '../../Generator/RstGeneratorState.ts'
import { createRstCompilerPlugins } from '../../RstCompilerPlugin.ts'
import { RstParagraph } from '../../RstNode/Block/Paragraph.ts'
import { RstDirective } from '../../RstNode/ExplicitMarkup/Directive.ts'
import { RstBulletList } from '../../RstNode/List/BulletList.ts'
import { RstTable } from '../../RstNode/Table/Table.ts'
import { assertNode } from '../../utils/assertNode.ts'

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

const CSV_TABLE_DIRECTIVE = 'csv-table'

export const csvTableDirectiveGenerators = createDirectiveGenerators(
    [
        CSV_TABLE_DIRECTIVE,
    ],

    (generatorState, node) => {
        const paragraph = getCsvTableNode(generatorState, node)
        csvTableGenerators.htmlGenerator.generate(generatorState, paragraph, node)
    },

    (generatorState, node) => {
        const paragraph = getCsvTableNode(generatorState, node)
        csvTableGenerators.mdGenerator.generate(generatorState, paragraph, node)
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const tableDirectivePlugin = createRstCompilerPlugins({
    directiveGenerators: [
        tableDirectiveGenerators,
        listTableDirectiveGenerators,
        csvTableDirectiveGenerators,
    ],

    onBeforeParse: (parserOption) => {
        parserOption.directivesWithInitContent.push(TABLE_DIRECTIVE)
        parserOption.directivesWithInitContent.push(LIST_TABLE_DIRECTIVE)
        parserOption.directivesWithInitContent.push(CSV_TABLE_DIRECTIVE)
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

function getCsvTableNode(generatorState: RstGeneratorState, directiveNode: RstDirective): RstParagraph {
    assertNode(generatorState, directiveNode, 'Directive', 1)

    const paragraph = directiveNode.children[0]
    assertNode(generatorState, paragraph, 'Paragraph')

    return paragraph
}
