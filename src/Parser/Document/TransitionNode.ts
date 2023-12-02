import { escapeForRegExp } from '@/utils/escapeForRegExp.js'
import { RstNode, RstNodeType } from '../RstNode.js'
import { sectionChars } from './SectionNode.js'

export const transitionRe = new RegExp(`^(${sectionChars.map(escapeForRegExp).join('|')}){4,}[ ]*$`)

export class TransitionNode extends RstNode {
    type = RstNodeType.Transition
}
