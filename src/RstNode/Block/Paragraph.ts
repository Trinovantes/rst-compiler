import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson, RstNodeSource } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstGeneratorState } from '@/Generator/RstGeneratorState.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { RstLiteralBlock } from './LiteralBlock.js'
import { RstGeneratorError } from '@/Generator/RstGeneratorError.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#paragraphs
// ----------------------------------------------------------------------------

export class RstParagraph extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstParagraph {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstParagraph(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstParagraph {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstParagraph(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'Paragraph'
    }

    override get willRenderVisibleContent(): boolean {
        return !(this.textContent === '::' && (this.getNextSibling() instanceof RstLiteralBlock))
    }

    getOutputText(generatorState: RstGeneratorState): string | null {
        const childText = generatorState.getChildrenText(() => {
            generatorState.visitNodes(this.children)
        })

        switch (true) {
            case !(this.getNextSibling() instanceof RstLiteralBlock): {
                return childText // If Paragraph is not followed by LiteralBlock, then generate Paragraph as-is
            }

            case childText === '::': {
                return null // Do not generate Paragraph
            }

            case childText.endsWith(' ::'): {
                return childText.substring(0, childText.length - 3) // Remove " ::"
            }

            case childText.endsWith('::'): {
                return childText.substring(0, childText.length - 1) // Remove last ":"
            }
        }

        throw new RstGeneratorError(generatorState, 'Invalid childText')
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

export const paragraphParser: RstNodeParser<'Paragraph'> = {
    parse: (parserState, indentSize, parentType) => {
        const startLineIdx = parserState.lineIdx
        const paragraphText = parserState.parseBodyText(indentSize, parentType, /^[^\n]+$/)
        const endLineIdx = parserState.lineIdx
        const source: RstNodeSource = { startLineIdx, endLineIdx }
        return new RstParagraph(parserState.registrar, source, parserState.parseInlineNodes(paragraphText, source))
    },
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const paragraphGenerators = createNodeGenerators(
    'Paragraph',

    (generatorState, node) => {
        const outputText = node.getOutputText(generatorState)
        if (outputText === null) {
            generatorState.writeLineHtmlComment(node.textContent)
            return
        }

        generatorState.writeLineHtmlTag('p', node, () => {
            generatorState.writeLine(outputText)
        })
    },

    (generatorState, node) => {
        const outputText = node.getOutputText(generatorState)
        if (outputText === null) {
            generatorState.writeLineMdComment(node.textContent)
            return
        }

        generatorState.writeLine(outputText)
    },
)
