import { RstTransition } from '../../RstNode/Block/Transition.js'
import { escapeForRegExp } from '../../utils/escapeForRegExp.js'
import type { RstNodeParser } from '../RstParser.js'
import { sectionChars } from './sectionParser.js'

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
