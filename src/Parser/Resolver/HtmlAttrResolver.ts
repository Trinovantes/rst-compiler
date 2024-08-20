import { RstNode } from '@/RstNode/RstNode.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'
import { RstDocument } from '@/RstNode/Block/Document.js'
import { SimpleName } from '@/SimpleName.js'

export class HtmlAttrResolver {
    private readonly _nodesWithId = new Map<RstNode, SimpleName>() // Tracks nodes that are targeted by <a> somewhere (e.g. chained HyperlinkTarget, FootnoteDef, CitationDef) and maps to their intended id
    private readonly _nodesWithClass = new Map<RstNode, Array<RstDirective>>() // Tracks nodes that have user-defined html class set via "class" Directive

    hasForcedHtmlClass(node: RstNode): boolean {
        // Root cannot have html class
        if (node instanceof RstDocument) {
            return false
        }

        const nodeNeedsClass = this._nodesWithClass.has(node)
        const nodeDescendantNeedsClass = node.hasChild((child) => this._nodesWithClass.has(child))
        return nodeNeedsClass || nodeDescendantNeedsClass
    }

    getNodeHtmlId(node: RstNode): string | null {
        return this._nodesWithId.get(node) ?? null
    }

    getNodeHtmlClasses(node: RstNode): Array<string> {
        return this._nodesWithClass.get(node)?.map((directive) => directive.initContentText).toSorted() ?? []
    }

    registerNodeAsLinkable(node: RstNode, name: SimpleName): SimpleName {
        const existingName = this._nodesWithId.get(node)
        if (existingName) {
            return existingName
        }

        this._nodesWithId.set(node, name)
        return name
    }

    registerNodeWithClass(targetNode: RstNode, directiveNode: RstDirective): void {
        if (!this._nodesWithClass.has(targetNode)) {
            this._nodesWithClass.set(targetNode, [])
        }

        this._nodesWithClass.get(targetNode)?.push(directiveNode)
    }
}
