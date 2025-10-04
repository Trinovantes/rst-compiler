import { RstNode, type RstNodeJson } from '../RstNode.ts'
import { RstFieldListItem } from './FieldListItem.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#field-lists
// ----------------------------------------------------------------------------

export class RstFieldList extends RstNode {
    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson): RstFieldList {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstFieldList(registrar, structuredClone(json.source), children)
    }

    override clone(registrar: RstNodeRegistrar): RstFieldList {
        const clonedChildren = this.children.map((child) => child.clone(registrar))
        return new RstFieldList(registrar, structuredClone(this.source), clonedChildren)
    }

    override get nodeType(): RstNodeType {
        return 'FieldList'
    }

    hasField(fieldName: string): boolean {
        return this.getField(fieldName) !== null
    }

    getField(fieldName: string): string | null {
        for (const child of this.children) {
            if (!(child instanceof RstFieldListItem)) {
                continue
            }

            if (child.nameText === fieldName) {
                return child.bodyText
            }
        }

        return null
    }

    toMapString(): string {
        const lines = new Array<string>()

        for (const child of this.children) {
            if (!(child instanceof RstFieldListItem)) {
                continue
            }

            lines.push(`"${child.nameText}":"${child.bodyText}"`)
        }

        return lines.join('\n')
    }
}
