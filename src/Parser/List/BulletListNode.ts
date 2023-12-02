import { RstNode, RstNodeType } from '../RstNode.js'
import { ListItemNode } from './ListItemNode.js'

export const bulletListRe = /^[ ]*(([*+-])[ ]+)([^\n]*)$/

export class BulletListNode extends RstNode {
    type = RstNodeType.BulletList

    override toExpectString(selfVarName: string): string {
        let str = ''

        str += super.toExpectString(selfVarName)

        for (let i = 0; i < this._children.length; i++) {
            const child = this._children[i] as ListItemNode
            str += '\n' + `expect((${selfVarName}.children[${i}] as ListItemNode).bullet).toBe('${child.bullet}')`
        }

        return str
    }
}
