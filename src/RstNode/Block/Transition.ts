import { RstNode, RstNodeJson, RstNodeSource } from '../RstNode.js'
import { RstNodeParser } from '@/Parser/RstParser.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { escapeForRegExp } from '@/utils/escapeForRegExp.js'
import { sectionChars } from './Section.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#transitions
// ----------------------------------------------------------------------------

export class RstTransition extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
    ) {
        super(registrar, source)
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstTransition {
        return new RstTransition(registrar, structuredClone(json.source))
    }

    override clone(registrar: RstNodeRegistrar): RstTransition {
        return new RstTransition(registrar, structuredClone(this.source))
    }

    override get nodeType(): RstNodeType {
        return 'Transition'
    }
}

// ----------------------------------------------------------------------------
// MARK: Parser
// ----------------------------------------------------------------------------

const transitionMarkRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).map((c) => `${c}{4,}`).join('|')})[ ]*$`)

export const transitionParser: RstNodeParser<'Transition'> = {
    parse: (parserState, indentSize) => {
        const startLineIdx = parserState.lineIdx

        if (!parserState.peekIsIndented(indentSize)) {
            return null
        }
        if (!parserState.peekTest(transitionMarkRe)) {
            return null
        }

        // Consume the transition line
        parserState.consume()

        const endLineIdx = parserState.lineIdx
        return new RstTransition(parserState.registrar, { startLineIdx, endLineIdx })
    },
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const transitionGenerators = createNodeGenerators(
    'Transition',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('hr', node)
    },

    (generatorState) => {
        generatorState.writeLine('---')
    },
)
