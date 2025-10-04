import { RstNode } from '../../RstNode/RstNode.ts'
import { RstDirective } from '../../RstNode/ExplicitMarkup/Directive.ts'
import { RstDocument } from '../../RstNode/Block/Document.ts'
import { sanitizeSimpleName, type SimpleName, type SanitizedSimpleName } from '../../SimpleName.ts'

export class HtmlAttrResolver {
    private _idCounter = 0

    private readonly _htmlIds = new Set<SanitizedSimpleName>() // Set of values from _nodesWithId map (used for fast lookups)
    private readonly _nodesWithId = new Map<RstNode, SanitizedSimpleName>() // Tracks nodes that are targeted by <a> somewhere (e.g. chained HyperlinkTarget, FootnoteDef, CitationDef) and maps to their intended id
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

    registerNodeAsLinkable(node: RstNode, name: SimpleName): SanitizedSimpleName {
        const existingName = this._nodesWithId.get(node)
        if (existingName) {
            return existingName
        }

        const htmlId = this.getNextAvailableHtmlId(name)

        this._htmlIds.add(htmlId)
        this._nodesWithId.set(node, htmlId)

        return htmlId
    }

    registerNodeWithClass(targetNode: RstNode, directiveNode: RstDirective): void {
        if (!this._nodesWithClass.has(targetNode)) {
            this._nodesWithClass.set(targetNode, [])
        }

        this._nodesWithClass.get(targetNode)?.push(directiveNode)
    }

    private getNextAvailableHtmlId(simpleName: SimpleName): SanitizedSimpleName {
        let candidateName = sanitizeSimpleName(simpleName)

        while (true) {
            if (!this._htmlIds.has(candidateName)) {
                return candidateName
            }

            this._idCounter += 1
            candidateName = sanitizeSimpleName(`id${this._idCounter}`)
        }
    }
}
