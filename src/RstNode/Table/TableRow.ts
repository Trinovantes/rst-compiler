import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { RstGeneratorError } from '@/Generator/RstGeneratorError.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstTableRowData = {
    isHeadRow: boolean
}

export class RstTableRow extends RstNode {
    readonly isHeadRow: boolean

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        isHeadRow: boolean,
    ) {
        super(registrar, source, children)
        this.isHeadRow = isHeadRow
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        if (this.isHeadRow) {
            root.data = {
                isHeadRow: this.isHeadRow,
            }
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstTableRowData>

        root.data = {
            isHeadRow: this.isHeadRow,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTableRowData>): RstTableRow {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstTableRow(registrar, structuredClone(json.source), children, json.data.isHeadRow)
    }

    override clone(registrar: RstNodeRegistrar): RstTableRow {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstTableRow(registrar, structuredClone(this.source), children, this.isHeadRow)
    }

    override get nodeType(): RstNodeType {
        return 'TableRow'
    }

    override toShortString(): string {
        return `${super.toShortString()} isHeadRow:${this.isHeadRow}`
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const tableRowGenerators = createNodeGenerators(
    'TableRow',

    (generatorState, node) => {
        throw new RstGeneratorError(generatorState, node, 'This should not be called directly')
    },

    (generatorState, node) => {
        generatorState.writeLineVisitor(() => {
            for (const cell of node.children) {
                generatorState.writeText('|')
                generatorState.visitNode(cell)
            }

            generatorState.writeText('|')
        })

        // Markdown requires header separator to be printed after first row to parse as table
        if (node.getMyIndexInParent() === 0) {
            generatorState.writeLineVisitor(() => {
                for (let i = 0; i < node.children.length; i++) {
                    generatorState.writeText('|')
                    generatorState.writeText(' --- ')
                }

                generatorState.writeText('|')
            })
        }
    },
)
