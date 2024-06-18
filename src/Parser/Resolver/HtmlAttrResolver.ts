import { RstNode } from '@/RstNode/RstNode.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'
import { RstDocument } from '@/RstNode/Block/Document.js'

export class HtmlAttrResolver {
    private readonly _nodesNeedIdAttr = new Set<RstNode>() // Tracks nodes that are targeted by <a> somewhere (e.g. chained HyperlinkTarget, FootnoteDef, CitationDef)
    private readonly _nodesWithHtmlClass = new Map<RstNode, Array<RstDirective>>() // Tracks nodes that have user-defined html class set via "class" directive

    markNodeAsTargeted(node: RstNode) {
        this._nodesNeedIdAttr.add(node)
    }

    markNodesAsTargeted(nodes: ReadonlyArray<RstNode>) {
        for (const node of nodes) {
            this.markNodeAsTargeted(node)
        }
    }

    hasForcedHtmlId(node: RstNode): boolean {
        return this._nodesNeedIdAttr.has(node)
    }

    hasForcedHtmlClass(node: RstNode): boolean {
        // Root cannot have html class
        if (node instanceof RstDocument) {
            return false
        }

        const rootNeedsClass = this._nodesWithHtmlClass.has(node)
        const descendantNeedsClass = node.hasChild((child) => this._nodesWithHtmlClass.has(child))
        return rootNeedsClass || descendantNeedsClass
    }

    getNodeHtmlClasses(node: RstNode): Array<string> {
        return this._nodesWithHtmlClass.get(node)?.map((directive) => directive.initContentText).toSorted() ?? []
    }

    registerNodeWithClass(targetNode: RstNode, directiveNode: RstDirective) {
        if (!this._nodesWithHtmlClass.has(targetNode)) {
            this._nodesWithHtmlClass.set(targetNode, [])
        }

        this._nodesWithHtmlClass.get(targetNode)?.push(directiveNode)
    }
}
