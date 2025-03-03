import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { ContinuousText } from '../Inline/Text.js'
import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstDefinitionListItemData = {
    term: Array<RstNodeJson>
    classifiers: Array<Array<RstNodeJson>>
    definition: Array<RstNodeJson>
}

export class RstDefinitionListItem extends RstNode {
    readonly term: ContinuousText
    readonly classifiers: ReadonlyArray<ContinuousText>
    readonly definition: ReadonlyArray<RstNode>

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        term: ContinuousText,
        classifiers: ReadonlyArray<ContinuousText>,
        definition: ReadonlyArray<RstNode>,
    ) {
        super(registrar, source)
        this.term = term
        this.classifiers = classifiers
        this.definition = definition
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            term: this.term.map((node) => node.toObject()),
            classifiers: this.classifiers.map((classifier) => classifier.map((node) => node.toObject())),
            definition: this.definition.map((bodyNode) => bodyNode.toObject()),
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstDefinitionListItemData>

        root.data = {
            term: this.term.map((node) => node.toJSON()),
            classifiers: this.classifiers.map((classifier) => classifier.map((node) => node.toJSON())),
            definition: this.definition.map((bodyNode) => bodyNode.toJSON()),
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstDefinitionListItemData>): RstDefinitionListItem {
        const term = json.data.term.map((childJson) => registrar.reviveRstTextFromJson(childJson))
        const classifiers = json.data.classifiers.map((classifierTextNodes) => classifierTextNodes.map((childJson) => registrar.reviveRstTextFromJson(childJson)))
        const definition = json.data.definition.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstDefinitionListItem(registrar, structuredClone(json.source), term, classifiers, definition)
    }

    override clone(registrar: RstNodeRegistrar): RstDefinitionListItem {
        const term = this.term.map((child) => child.clone(registrar))
        const classifiers = this.classifiers.map((classifierTextNodes) => classifierTextNodes.map((child) => child.clone(registrar)))
        const definition = this.definition.map((child) => child.clone(registrar))
        return new RstDefinitionListItem(registrar, structuredClone(this.source), term, classifiers, definition)
    }

    override get nodeType(): RstNodeType {
        return 'DefinitionListItem'
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        let str = selfTab + `[${this.toShortString()}] (${this.lineNums})\n`

        str += selfTab + '  (Term)' + '\n'
        for (const node of this.term) {
            str += node.toString(depth + 2)
        }

        str += selfTab + `  (Classifiers len:${this.classifiers.length})` + '\n'
        for (const classifier of this.classifiers) {
            str += selfTab + '    (Classifier)' + '\n'

            for (const node of classifier) {
                str += node.toString(depth + 3)
            }
        }

        str += selfTab + '  (Definition)' + '\n'
        for (const node of this.definition) {
            str += node.toString(depth + 2)
        }

        return str
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const definitionListItemGenerators = createNodeGenerators(
    'DefinitionListItem',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('dt', node, () => {
            generatorState.writeLineVisitor(() => {
                for (const textNode of node.term) {
                    generatorState.visitNode(textNode)
                }

                for (const classifier of node.classifiers) {
                    generatorState.writeText(' ')
                    generatorState.writeText(`<span class="${generatorState.opts.htmlClass.definitionListItemClassifier}">`)

                    for (const textNode of classifier) {
                        generatorState.visitNode(textNode)
                    }

                    generatorState.writeText('</span>')
                }
            })
        })

        generatorState.writeLineHtmlTag('dd', node, () => {
            generatorState.visitNodes(node.definition)
        })
    },

    (generatorState, node) => {
        // First line contains term
        generatorState.writeLineVisitor(() => {
            generatorState.writeText('**')

            for (const textNode of node.term) {
                generatorState.visitNode(textNode)
            }

            for (const classifier of node.classifiers) {
                generatorState.writeText(' ')
                generatorState.writeText('*')

                for (const textNode of classifier) {
                    generatorState.visitNode(textNode)
                }

                generatorState.writeText('*')
            }

            generatorState.writeText('**')
        })

        // Empty line between term and definition
        generatorState.writeLine()

        // Subsequent lines contain definitions
        generatorState.visitNodes(node.definition)
    },
)
