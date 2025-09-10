import { RstNode, type RstNodeJson } from '../RstNode.js'
import type { RstGeneratorState } from '../../Generator/RstGeneratorState.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'
import { RstGeneratorError } from '../../Generator/RstGeneratorError.js'

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
        return !(this.textContent === '::' && this.getNextSibling()?.nodeType === 'LiteralBlock')
    }

    getOutputText(generatorState: RstGeneratorState): string | null {
        const childText = generatorState.getChildrenText(() => {
            generatorState.visitNodes(this.children)
        })

        switch (true) {
            case this.getNextSibling()?.nodeType !== 'LiteralBlock': {
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
