import { Brand } from '@/@types/Brand.js'
import { RstCitationDef } from '@/RstNode/ExplicitMarkup/CitationDef.js'
import { RstFootnoteDef } from '@/RstNode/ExplicitMarkup/FootnoteDef.js'
import { RstHyperlinkTarget } from '@/RstNode/ExplicitMarkup/HyperlinkTarget.js'
import { RstCitationRef } from '@/RstNode/Inline/CitationRef.js'
import { RstFootnoteRef } from '@/RstNode/Inline/FootnoteRef.js'
import { RstHyperlinkRef } from '@/RstNode/Inline/HyperlinkRef.js'
import { RstInlineInternalTarget } from '@/RstNode/Inline/InlineInternalTarget.js'
import { RstNode } from '@/RstNode/RstNode.js'
import { getAutoFootnoteSymbol } from '@/utils/getAutoFootnoteSymbol.js'
import { SimpleName, normalizeSimpleName } from '@/SimpleName.js'
import { RstCompiler } from '@/RstCompiler.js'
import { RstSection } from '@/RstNode/Block/Section.js'
import { HtmlAttrResolver } from './HtmlAttrResolver.js'
import { RstDocument } from '@/RstNode/Block/Document.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'

type FootnoteLabelNum = Brand<number, 'FootnoteLabelNum'> // For identifying/referencing footnote in document
type FootnoteSymNum = Brand<number, 'FootnoteSymNum'> // For determining which symbol to render

/**
 * A target in current Document
 *
 * If alias = true, then it needs to be recursively resolved
 * If alias = false, then target can be used as literal url (e.g. inside <a>)
 */
type DocumentTarget = {
    target: string // Either a url or ref (SimpleName)
    isAlias: boolean
    targetNode?: RstNode // If targets a node inside this document
}

export class SimpleNameResolver {
    private readonly _simpleNameToTarget = new Map<SimpleName, DocumentTarget>()
    private readonly _nodesTargetableFromOutside = new Map<SimpleName, RstNode>() // Other Documents can use these SimpleNames to reference a link inside here

    // Cached data that need to be filled after parsing
    private readonly _sectionSimpleNames = new Map<RstSection, SimpleName>()
    private readonly _footnoteDefToLabelNum = new Map<RstFootnoteDef, FootnoteLabelNum>()
    private readonly _footnoteDefToSymNum = new Map<RstFootnoteDef, FootnoteSymNum>()
    private readonly _footnoteDefBacklinks = new Map<RstFootnoteDef, Array<RstFootnoteRef>>()
    private readonly _footnoteRefToDef = new Map<RstFootnoteRef, RstFootnoteDef>()
    private readonly _citationDefBacklinks = new Map<RstCitationDef, Array<RstCitationRef>>()
    private readonly _citationRefToDef = new Map<RstCitationRef, RstCitationDef>()

    constructor(
        private readonly _compiler: RstCompiler,
        private readonly _htmlAttrResolver: HtmlAttrResolver,
        private readonly _root: RstDocument,
    ) {
        this.registerSections()
        this.registerFootnotes()
        this.registerCitations()
        this.registerHyperlinks()
    }

    getSimpleName(node: RstNode): SimpleName {
        for (const plugin of this._compiler.plugins) {
            const simpleName = plugin.getSimpleName?.(node)
            if (simpleName) {
                return simpleName
            }
        }

        if (node instanceof RstSection) {
            const simpleName = this._sectionSimpleNames.get(node)
            if (!simpleName) {
                throw new Error(`Failed to getSimpleName for [${node.toShortString()}]`)
            }

            return simpleName
        }

        if (node instanceof RstFootnoteRef) {
            return normalizeSimpleName(`${node.nodeType}-${node.nthOfType}`)
        }

        if (node instanceof RstFootnoteDef) {
            const autoNumLabel = /^#(?<autoNumLabel>.+)$/.exec(node.label)?.groups?.autoNumLabel
            if (autoNumLabel) {
                return normalizeSimpleName(autoNumLabel)
            }

            const labelNum = this._footnoteDefToLabelNum.get(node)
            if (labelNum) {
                return normalizeSimpleName(`${node.nodeType}-${labelNum}`)
            }

            throw new Error(`Failed to getSimpleName for [${node.toShortString()}]`)
        }

        if (node instanceof RstCitationRef) {
            return normalizeSimpleName(`${node.nodeType}-${node.nthOfType}`)
        }

        if (node instanceof RstCitationDef) {
            return normalizeSimpleName(node.label)
        }

        if (node instanceof RstHyperlinkRef) {
            // Explicitly named HyperlinkRef that links elsewhere can be referenced by their label
            // e.g. `label <url not same as label>`
            if (node.isEmbeded) {
                return normalizeSimpleName(node.label)
            }
        }

        if (node instanceof RstHyperlinkTarget) {
            if (node.isAnonymous) {
                return normalizeSimpleName(`${node.nodeType}-anonymous-${node.nthOfType}`)
            } else {
                return normalizeSimpleName(node.label)
            }
        }

        if (node instanceof RstInlineInternalTarget) {
            return normalizeSimpleName(node.textContent)
        }

        return normalizeSimpleName(`${node.nodeType}-${node.nthOfType}`)
    }

    // ------------------------------------------------------------------------
    // MARK: Internal Targetable Nodes
    // ------------------------------------------------------------------------

    resolveNodeToUrl(node: RstNode): string | null {
        const simpleName = this.getSimpleName(node)
        return this.resolveSimpleNameToUrl(simpleName)
    }

    resolveSimpleNameToUrl(simpleName: SimpleName): string | null {
        const seenSimpleNames = new Set<SimpleName>() // To avoid infinite loops

        while (true) {
            if (seenSimpleNames.has(simpleName)) {
                return null
            }

            const target = this._simpleNameToTarget.get(simpleName)
            if (!target) {
                return null
            }

            if (!target.isAlias) {
                return target.target
            }

            seenSimpleNames.add(simpleName)
            simpleName = normalizeSimpleName(target.target)
        }
    }

    registerNodeForwardTarget(simpleName: SimpleName, fowardTarget: DocumentTarget) {
        this._simpleNameToTarget.set(simpleName, fowardTarget)
    }

    registerNodeAsTargetable(node: RstNode): DocumentTarget {
        const simpleName = this.getSimpleName(node)
        const target = {
            target: `#${simpleName}`,
            isAlias: false,
        }

        this._simpleNameToTarget.set(simpleName, target)
        this._htmlAttrResolver.markNodeAsTargeted(node)

        return target
    }

    // ------------------------------------------------------------------------
    // MARK: External Targetable Nodes
    // ------------------------------------------------------------------------

    registerExternalTargetableNode(simpleName: SimpleName, targetNode?: RstNode) {
        if (!targetNode) {
            return
        }

        this._nodesTargetableFromOutside.set(simpleName, targetNode)
        this._htmlAttrResolver.markNodeAsTargeted(targetNode)
    }

    resolveSimpleNameFromOutside(simpleName: SimpleName): RstNode | null {
        return this._nodesTargetableFromOutside.get(simpleName) ?? null
    }

    get simpleNamesTargetableFromOutside(): Array<SimpleName> {
        return [...this._nodesTargetableFromOutside.keys()]
    }

    // ------------------------------------------------------------------------
    // MARK: Sections
    // ------------------------------------------------------------------------

    private registerSections() {
        const sections = this._root.findAllChildren(RstNodeType.Section)

        const registerSectionSimpleNames = () => {
            const uniqueSimpleNames = new Set<SimpleName>()

            for (const section of sections) {
                const simpleNameFromText = normalizeSimpleName(section.textContent)
                const simpleNameFromNode = normalizeSimpleName(`${section.nodeType}-${section.nthOfType}`)

                if (uniqueSimpleNames.has(simpleNameFromText)) {
                    this._sectionSimpleNames.set(section, simpleNameFromNode)
                } else {
                    uniqueSimpleNames.add(simpleNameFromText)
                    this._sectionSimpleNames.set(section, simpleNameFromText)
                }
            }
        }

        const registerSections = () => {
            for (const section of sections) {
                this.registerNodeAsTargetable(section)
            }
        }

        registerSectionSimpleNames()
        registerSections()
    }

    // ------------------------------------------------------------------------
    // MARK: Footnote
    // ------------------------------------------------------------------------

    getFootnoteDefBacklinks(footnoteDef: RstFootnoteDef): Array<SimpleName> {
        const footnoteRefs = this._footnoteDefBacklinks.get(footnoteDef) ?? []
        return footnoteRefs.map((footnoteRef) => this.getSimpleName(footnoteRef))
    }

    resolveFootnoteDefLabel(footnoteDef: RstFootnoteDef): string | null {
        if (footnoteDef.isAutoSymbol) {
            const symNum = this._footnoteDefToSymNum.get(footnoteDef)
            if (!symNum) {
                return null
            }

            return getAutoFootnoteSymbol(symNum)
        }

        const labelNum = this._footnoteDefToLabelNum.get(footnoteDef)
        if (!labelNum) {
            return null
        }

        return labelNum.toString()
    }

    resolveFootnoteRefLabel(footnoteRef: RstFootnoteRef): string | null {
        const footnoteDef = this._footnoteRefToDef.get(footnoteRef)
        if (!footnoteDef) {
            return null
        }

        return this.resolveFootnoteDefLabel(footnoteDef)
    }

    resolveFootnoteRefToDef(footnoteRef: RstFootnoteRef): RstFootnoteDef | null {
        return this._footnoteRefToDef.get(footnoteRef) ?? null
    }

    private registerFootnotes() {
        const footnoteDefs = this._root.findAllChildren(RstNodeType.FootnoteDef)
        const footnoteRefs = this._root.findAllChildren(RstNodeType.FootnoteRef)

        const registerAutoLabelNums = () => {
            const usedLabelNums = new Set<number>()
            let autoLabelNumCounter = 1

            const getNextLabelNum = (): number => {
                let labelNum = autoLabelNumCounter++
                while (usedLabelNums.has(labelNum)) {
                    labelNum++
                }
                return labelNum
            }

            // 1. Register all manual footnotes
            for (const footnoteDef of footnoteDefs) {
                if (!footnoteDef.isManualLabelNum) {
                    continue
                }

                const labelNum = parseInt(footnoteDef.label)
                this._footnoteDefToLabelNum.set(footnoteDef, labelNum as FootnoteLabelNum)
                usedLabelNums.add(labelNum)
            }

            // 2. Assign each auto footnote to next labelNum that hasn't been used by manual footnote yet
            for (const footnoteDef of footnoteDefs) {
                if (footnoteDef.isManualLabelNum) {
                    continue
                }

                const labelNum = getNextLabelNum()
                this._footnoteDefToLabelNum.set(footnoteDef, labelNum as FootnoteLabelNum)
                usedLabelNums.add(labelNum)
            }
        }

        const registerAutoSymbols = () => {
            let autoSymbolCounter = 1

            for (const footnoteDef of footnoteDefs) {
                if (!footnoteDef.isAutoSymbol) {
                    continue
                }

                const symNum = autoSymbolCounter++
                this._footnoteDefToSymNum.set(footnoteDef, symNum as FootnoteSymNum)
            }
        }

        const registerBacklinks = () => {
            const usedIdices = new Set<number>() // Keep track of FootnoteDef '#' that have already been consumed
            const findFootnoteDef = (footnoteRef: RstFootnoteRef): RstFootnoteDef | null => {
                for (const [idx, footnoteDef] of footnoteDefs.entries()) {
                    if (footnoteDef.label === '#' && usedIdices.has(idx)) {
                        continue
                    }

                    if (!footnoteDef.isTargetedByFootnoteRef(footnoteRef)) {
                        continue
                    }

                    usedIdices.add(idx)
                    return footnoteDef
                }

                return null
            }

            // 1. Init backlinks array for each Def
            for (const footnoteDef of footnoteDefs) {
                this._footnoteDefBacklinks.set(footnoteDef, [])
            }

            // 2. Add each Ref to their targeted Def's backlinks array
            for (const footnoteRef of footnoteRefs) {
                const footnoteDef = findFootnoteDef(footnoteRef)
                if (!footnoteDef) {
                    this._compiler.notifyWarning(`Failed get footnoteDef for [${footnoteRef.toShortString()}]`)
                    return
                }

                this._footnoteRefToDef.set(footnoteRef, footnoteDef)
                this._footnoteDefBacklinks.get(footnoteDef)?.push(footnoteRef)
            }
        }

        const registerFootnotes = () => {
            // Must be done last because this rely on SimpleNames that are dependant on resolved AutoLabelNums and AutoSymbols
            for (const node of [...footnoteDefs, ...footnoteRefs]) {
                this.registerNodeAsTargetable(node)
            }
        }

        registerAutoLabelNums()
        registerAutoSymbols()
        registerBacklinks()
        registerFootnotes()
    }

    // ------------------------------------------------------------------------
    // MARK: Citation
    // ------------------------------------------------------------------------

    getCitationDefBacklinks(citationDef: RstCitationDef): Array<SimpleName> {
        const refs = this._citationDefBacklinks.get(citationDef) ?? []
        return refs.map((citationRef) => this.getSimpleName(citationRef))
    }

    getCitationDef(citationRef: RstCitationRef): RstCitationDef {
        const citationDef = this._citationRefToDef.get(citationRef)
        if (!citationDef) {
            throw new Error(`Failed to get citationDef for [${citationRef.toShortString()}]`)
        }

        return citationDef
    }

    private registerCitations() {
        const citationDefs = this._root.findAllChildren(RstNodeType.CitationDef)
        const citationRefs = this._root.findAllChildren(RstNodeType.CitationRef)

        const registerCitationBacklinks = () => {
            // 1. Init backlinks array for each Def
            for (const citationDef of citationDefs) {
                this._citationDefBacklinks.set(citationDef, [])
            }

            // 2. Add each Ref to their targeted Def's backlinks array
            for (const citationRef of citationRefs) {
                const citationDef = citationDefs.find((citationDef) => citationDef.isTargetedByCitationRef(citationRef))
                if (!citationDef) {
                    this._compiler.notifyWarning(`Failed get citationDef for [${citationRef.toShortString()}]`)
                    return
                }

                this._citationRefToDef.set(citationRef, citationDef)
                this._citationDefBacklinks.get(citationDef)?.push(citationRef)
            }
        }

        const registerCitations = () => {
            for (const node of [...citationDefs, ...citationRefs]) {
                this.registerNodeAsTargetable(node)
            }
        }

        registerCitationBacklinks()
        registerCitations()
    }

    // ------------------------------------------------------------------------
    // MARK: Hyperlink
    // ------------------------------------------------------------------------

    private registerHyperlinks() {
        const hyperlinkTargets = this._root.findAllChildren(RstNodeType.HyperlinkTarget)
        const hyperlinkTargetsAnonymous = hyperlinkTargets.filter((target) => target.isAnonymous)
        const inlineInternalTargets = this._root.findAllChildren(RstNodeType.InlineInternalTarget)
        const hyperlinkRefs = this._root.findAllChildren(RstNodeType.HyperlinkRef)

        const resolveHyperlinkTarget = (hyperlinkTarget: RstHyperlinkTarget): DocumentTarget | null => {
            if (hyperlinkTarget.isTargetingNextNode) {
                // Follow the chain to find an explicit name
                let currNode: RstNode | null = hyperlinkTarget

                while (true) {
                    currNode = currNode?.getNextNodeInTree() ?? null
                    if (!currNode) {
                        return null
                    }

                    if (currNode instanceof RstHyperlinkTarget) {
                        return resolveHyperlinkTarget(currNode)
                    }

                    if (currNode.willRenderVisibleContent) {
                        return {
                            ...this.registerNodeAsTargetable(currNode),
                            targetNode: currNode,
                        }
                    }
                }
            }

            return {
                target: hyperlinkTarget.target,
                isAlias: hyperlinkTarget.isAlias,
            }
        }

        const resolveInlineInternalTarget = (inlineInternalTarget: RstInlineInternalTarget): DocumentTarget | null => {
            return {
                target: `#${this.getSimpleName(inlineInternalTarget)}`,
                isAlias: false,
                targetNode: inlineInternalTarget,
            }
        }

        const resolveHyperlinkRef = (hyperlinkRef: RstHyperlinkRef): DocumentTarget | null => {
            // Anonymous HyperlinkRefs without embeded url e.g. `example`__ can only reference anonymous HyperlinkTargets
            if (hyperlinkRef.isAnonymous && !hyperlinkRef.isEmbeded) {
                const idx = hyperlinkRef.nthOfType - 1
                if (idx < 0 || idx >= hyperlinkTargetsAnonymous.length) {
                    return null
                }

                const hyperlinkTarget = hyperlinkTargetsAnonymous[idx]
                return resolveHyperlinkTarget(hyperlinkTarget)
            }

            return {
                target: hyperlinkRef.target,
                isAlias: hyperlinkRef.isAlias,
            }
        }

        const registerHyperlinkTargets = () => {
            for (const hyperlinkTarget of hyperlinkTargets) {
                const target = resolveHyperlinkTarget(hyperlinkTarget)
                if (!target) {
                    this._compiler.notifyWarning(`Failed to resolve [${hyperlinkTarget.toShortString()}]`)
                    continue
                }

                const simpleName = this.getSimpleName(hyperlinkTarget)
                this.registerNodeForwardTarget(simpleName, target)
                this.registerExternalTargetableNode(simpleName, target.targetNode)
            }
        }

        const registerInlineInternalTargets = () => {
            for (const inlineTarget of inlineInternalTargets) {
                const target = resolveInlineInternalTarget(inlineTarget)
                if (!target) {
                    this._compiler.notifyWarning(`Failed to resolve [${inlineTarget.toShortString()}]`)
                    continue
                }

                const simpleName = this.getSimpleName(inlineTarget)
                this.registerNodeForwardTarget(simpleName, target)
                this.registerExternalTargetableNode(simpleName, target.targetNode)
            }
        }

        const registerHyperlinkRefs = () => {
            for (const hyperlinkRef of hyperlinkRefs) {
                const target = resolveHyperlinkRef(hyperlinkRef)
                if (!target) {
                    this._compiler.notifyWarning(`Failed to resolve [${hyperlinkRef.toShortString()}]`)
                    continue
                }

                const simpleName = this.getSimpleName(hyperlinkRef)
                this.registerNodeForwardTarget(simpleName, target)
            }
        }

        registerHyperlinkTargets()
        registerInlineInternalTargets()
        registerHyperlinkRefs()
    }
}
