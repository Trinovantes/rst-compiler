import { romanToInt } from '@/utils/romanToInt.js'
import { RstNode, RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.js'
import { RstEnumeratedList } from './EnumeratedList.js'
import { RstEnumeratedListType } from './EnumeratedListType.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'
import { HtmlAttributeStore } from '@/Generator/HtmlAttributeStore.js'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstBulletListItemData = {
    bullet: string
}

export class RstBulletListItem extends RstNode {
    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        readonly bullet: string,
    ) {
        super(registrar, source, children)
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            bullet: this.bullet,
        }

        return root
    }

    override toJson(): RstNodeJson {
        const root = super.toJson() as RstNodeJson<RstBulletListItemData>

        root.data = {
            bullet: this.bullet,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstBulletListItemData>): RstBulletListItem {
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstBulletListItem(registrar, structuredClone(json.source), children, json.data.bullet)
    }

    override clone(registrar: RstNodeRegistrar): RstBulletListItem {
        const children = this.children.map((child) => child.clone(registrar))
        return new RstBulletListItem(registrar, structuredClone(this.source), children, this.bullet)
    }

    override get nodeType(): RstNodeType {
        return RstNodeType.BulletListItem
    }

    override toShortString(): string {
        return `${super.toShortString()} "${this.bullet}"`
    }

    isEnumeratedListFirstValue(): boolean {
        switch (this.bullet) {
            case '#':
            case '1':
            case 'A':
            case 'a':
            case 'I':
            case 'i':
                return true
        }

        return false
    }

    getEnumeratedListValue(): number {
        if (this.bullet === '#') {
            return this.getMyIndexInParent() + 1
        }

        const parent = this.getParent(RstNodeType.EnumeratedList)
        switch (parent.listType) {
            case RstEnumeratedListType.AlphabetUpper:
            case RstEnumeratedListType.AlphabetLower: {
                const letter = this.bullet.toLowerCase()
                return letter.charCodeAt(0) - 'a'.charCodeAt(0) + 1
            }

            case RstEnumeratedListType.RomanUpper:
            case RstEnumeratedListType.RomanLower:
                return romanToInt(this.bullet)

            default:
                return parseInt(this.bullet)
        }
    }
}

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const bulletListItemGenerators = createNodeGenerators(
    RstNodeType.BulletListItem,

    (generatorState, node) => {
        const attrs = new HtmlAttributeStore()
        if (node.parent instanceof RstEnumeratedList && node.isFirstChild() && !node.isEnumeratedListFirstValue()) {
            attrs.set('value', node.getEnumeratedListValue().toString())
        }

        generatorState.writeLineHtmlTagWithAttr('li', node, attrs, () => {
            generatorState.visitNodes(node.children)
        })
    },

    (generatorState, node) => {
        const bullet = node.parent instanceof RstEnumeratedList
            ? `${node.getEnumeratedListValue()}. `
            : `${node.bullet} `
        const bulletWhitespace = ' '.repeat(bullet.length)

        generatorState.usePrefix({
            val: bullet,
            replacementAfterOnce: bulletWhitespace,
        }, () => {
            generatorState.visitNodes(node.children)
        })
    },
)
