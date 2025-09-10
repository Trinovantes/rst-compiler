import { RstNode, type RstNodeJson, type RstNodeSource } from '../RstNode.js'
import { RstFieldList } from '../List/FieldList.js'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.js'
import type { RstNodeType } from '../RstNodeType.js'

// ----------------------------------------------------------------------------
// MARK: Node
// https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#document
// ----------------------------------------------------------------------------

export type RstDocumentData = {
    readonly docMeta: RstNodeJson | null
}

export class RstDocument extends RstNode {
    readonly docMeta: RstFieldList | null

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
        docMeta: RstFieldList | null,
    ) {
        super(registrar, source, children)
        this.docMeta = docMeta
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstDocumentData>

        root.data = {
            docMeta: this.docMeta?.toJSON() ?? null,
        }

        return root
    }

    static reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstDocumentData>): RstDocument {
        const docMeta = json.data.docMeta ? RstFieldList.reviveRstNodeFromJson(registrar, json.data.docMeta) : null
        const children = json.children.map((childJson) => registrar.reviveRstNodeFromJson(childJson))
        return new RstDocument(registrar, structuredClone(json.source), children, docMeta)
    }

    override clone(registrar: RstNodeRegistrar): RstDocument {
        const docMeta = this.docMeta?.clone(registrar) ?? null
        const children = this.children.map((child) => child.clone(registrar))
        return new RstDocument(registrar, structuredClone(this.source), children, docMeta)
    }

    override get nodeType(): RstNodeType {
        return 'Document'
    }

    override get shouldTestTextContent(): boolean {
        return false
    }

    override toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)

        // Prints line numbers in 1-based counting for ease of reading
        let str = selfTab + `[${this.toShortString()}] (${this.lineNums})\n`

        if (this.docMeta) {
            str += selfTab + '  (Meta)' + '\n'
            str += this.docMeta.toString(depth + 2)
        }

        if (this.children.length > 0) {
            str += selfTab + '  (Children)' + '\n'
            for (const child of this.children) {
                str += child.toString(depth + 2)
            }
        }

        return str
    }
}
