import { RstNode, RstNodeType } from '../RstNode.js'

export const bulletListRe = /^([ ]*)([*+-][ ]+)([^\n]*)$/

export class BulletListNode extends RstNode {
    type = RstNodeType.BulletList
}
