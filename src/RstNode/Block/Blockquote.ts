import { RstNodeParser } from '@/Parser/RstParser.js'
import { RstNode, RstNodeJson } from '../RstNode.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#block-quotes
// ----------------------------------------------------------------------------

export class RstBlockquote extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstBlockquote {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstBlockquote(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstBlockquote {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstBlockquote(registrar, structuredClone(this.source), children)
    }

    override get nodeType(): RstNodeType {
        return 'Blockquote'
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

export const blockquoteParser: RstNodeParser<'Blockquote'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        const nextIndentSize = indentSize + parserState.opts.inputIndentSize
        if (!parserState.peekIsAtleastIndented(nextIndentSize)) {
            return null
        }

        const children = parserState.parseBodyNodes(nextIndentSize, 'Blockquote')

        const endLineIdx = parserState.lineIdx
        return new RstBlockquote(parserState.registrar, { startLineIdx, endLineIdx }, children)
    },
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const blockquoteGenerators = createNodeGenerators(
    'Blockquote',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('blockquote', node, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        generatorState.usePrefix({ val: '> ' }, () => {
            generatorState.visitNodes(node.children)
        })
    },
)
