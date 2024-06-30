import { RstNode, RstNodeSource, RstNodeJson, RstNodeObject } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { RstParagraph } from '../Block/Paragraph.js'
import { RstGeneratorError } from '@/Generator/RstGeneratorError.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstTableCellData = {
    rowSpan: number
    colSpan: number
    characterWidth: number
}

export class RstTableCell extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        readonly rowSpan: number,
        readonly colSpan: number,
        readonly characterWidth: number,
    ) {
        if (rowSpan < 1 || colSpan < 1) {
            throw new Error(`Invalid colspan:${colSpan} rowspan:${rowSpan}`)
        }

        super(registrar, source, children)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        if (this.rowSpan !== 1 || this.colSpan !== 1) {
            root.data = {
                rowSpan: this.rowSpan,
                colSpan: this.colSpan,
            }
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstTableCellData>

        root.data = {
            rowSpan: this.rowSpan,
            colSpan: this.colSpan,
            characterWidth: this.characterWidth,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTableCellData>): RstTableCell {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstTableCell(registrar, structuredClone(json.source), children, json.data.rowSpan, json.data.colSpan, json.data.characterWidth)
    }

    override clone(registrar: RstNodeRegistrar): RstTableCell {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstTableCell(registrar, structuredClone(this.source), children, this.rowSpan, this.colSpan, this.characterWidth)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.TableCell
    }

    override toShortString(): string {
        return `${super.toShortString()} rowSpan:${this.rowSpan} colSpan:${this.colSpan}`
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const tableCellGenerators = createNodeGenerators(
    RstNodeType.TableCell,

    (generatorState, node) => {
        throw new RstGeneratorError(generatorState, node, 'This should not be called directly')
    },

    (generatorState, node) => {
        const cellText = generatorState.getChildrenText(() => {
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i]
                if (!(child instanceof RstParagraph)) {
                    throw new RstGeneratorError(generatorState, 'Cannot render non-paragraphs in Markdown tables')
                }
                if (i > 0) {
                    generatorState.writeText('<br>')
                }

                generatorState.visitNodes(child.children)
            }
        })

        generatorState.writeText(` ${cellText.replaceAll('\n', ' ')} `)
    },
)
