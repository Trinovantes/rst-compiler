import { Brand } from '@/@types/Brand.js'
import { RstCitationDef } from '@/RstNode/ExplicitMarkup/CitationDef.js'
import { RstFootnoteDef } from '@/RstNode/ExplicitMarkup/FootnoteDef.js'
import { RstHyperlinkTarget } from '@/RstNode/ExplicitMarkup/HyperlinkTarget.js'
import { RstCitationRef } from '@/RstNode/Inline/CitationRef.js'
import { RstFootnoteRef } from '@/RstNode/Inline/FootnoteRef.js'
import { RstHyperlinkRef } from '@/RstNode/Inline/HyperlinkRef.js'
import { RstInlineInternalTarget } from '@/RstNode/Inline/InlineInternalTarget.js'
import { RstNode } from '@/RstNode/RstNode.js'
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
}

/**
 * Caches data that need to be filled after parsing
 *
 * Data in this container class is consumed by RstGeneratorState
 */
export class SimpleNameResolver {
    private readonly _simpleNameToTarget = new Map<SimpleName, DocumentTarget>()
    private readonly _nodesTargetableFromOutside = new Map<SimpleName, RstNode>() // Other Documents can use these SimpleNames to reference a link inside here

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

    get simpleNameToTarget(): ReadonlyMap<SimpleName, DocumentTarget> {
        return this._simpleNameToTarget
    }

    get nodesTargetableFromOutside(): ReadonlyMap<SimpleName, RstNode> {
        return this._nodesTargetableFromOutside
    }

    get sectionSimpleNames(): ReadonlyMap<RstSection, SimpleName> {
        return this._sectionSimpleNames
    }

    get footnoteDefToLabelNum(): ReadonlyMap<RstFootnoteDef, FootnoteLabelNum> {
        return this._footnoteDefToLabelNum
    }

    get footnoteDefToSymNum(): ReadonlyMap<RstFootnoteDef, FootnoteSymNum> {
        return this._footnoteDefToSymNum
    }

    get footnoteDefBacklinks(): ReadonlyMap<RstFootnoteDef, ReadonlyArray<RstFootnoteRef>> {
        return this._footnoteDefBacklinks
    }

    get footnoteRefToDef(): ReadonlyMap<RstFootnoteRef, RstFootnoteDef> {
        return this._footnoteRefToDef
    }

    get citationDefBacklinks(): ReadonlyMap<RstCitationDef, ReadonlyArray<RstCitationRef>> {
        return this._citationDefBacklinks
    }

    get citationRefToDef(): ReadonlyMap<RstCitationRef, RstCitationDef> {
        return this._citationRefToDef
    }

    // ------------------------------------------------------------------------
    // MARK: Internal Targetable Nodes
    // ------------------------------------------------------------------------

    registerNodeForwardTarget(simpleName: SimpleName, fowardTarget: DocumentTarget): void {
        const existingTarget = this._simpleNameToTarget.get(simpleName)
        if (existingTarget && !(existingTarget.target === fowardTarget.target && existingTarget.isAlias === fowardTarget.isAlias)) {
            throw new Error(`Duplicate simpleName:"${simpleName}"`)
        }

        this._simpleNameToTarget.set(simpleName, fowardTarget)
    }

    registerNodeAsTargetable(node: RstNode): void {
        const simpleName = this.getSimpleName(node)
        const target = {
            target: `#${simpleName}`,
            isAlias: false,
        }

        this.registerNodeForwardTarget(simpleName, target)
        this._htmlAttrResolver.markNodeAsTargeted(node)
    }

    // ------------------------------------------------------------------------
    // MARK: External Targetable Nodes
    // ------------------------------------------------------------------------

    registerExternalTargetableNode(simpleName: SimpleName, targetNode: RstNode) {
        this._nodesTargetableFromOutside.set(simpleName, targetNode)
        this._htmlAttrResolver.markNodeAsTargeted(targetNode)
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
        const inlineInternalTargets = this._root.findAllChildren(RstNodeType.InlineInternalTarget)
        const hyperlinkRefs = this._root.findAllChildren(RstNodeType.HyperlinkRef)

        const resolveHyperlinkTarget = (hyperlinkTarget: RstHyperlinkTarget): DocumentTarget & { targetNode?: RstNode } | null => {
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
                            target: `#${this.getSimpleName(currNode)}`,
                            isAlias: false,
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

        const registerHyperlinkTargets = () => {
            for (const hyperlinkTarget of hyperlinkTargets) {
                const target = resolveHyperlinkTarget(hyperlinkTarget)
                if (!target) {
                    this._compiler.notifyWarning(`Failed to resolve [${hyperlinkTarget.toShortString()}]`)
                    continue
                }

                const simpleName = this.getSimpleName(hyperlinkTarget)
                this.registerNodeForwardTarget(simpleName, target)

                if (target.targetNode) {
                    this.registerExternalTargetableNode(simpleName, target.targetNode)
                }
            }
        }

        const registerInlineInternalTargets = () => {
            for (const inlineTarget of inlineInternalTargets) {
                const target: DocumentTarget = {
                    target: `#${this.getSimpleName(inlineTarget)}`,
                    isAlias: false,
                }

                const simpleName = this.getSimpleName(inlineTarget)
                this.registerNodeForwardTarget(simpleName, target)
                this.registerExternalTargetableNode(simpleName, inlineTarget)
            }
        }

        const registerHyperlinkRefs = () => {
            let anonymousRefIdx = 0
            const anonymousTargets = hyperlinkTargets.filter((target) => target.isAnonymous)
            const resolveHyperlinkRef = (hyperlinkRef: RstHyperlinkRef): DocumentTarget | null => {
                // Anonymous HyperlinkRefs without embeded url e.g. `example`__ can only reference anonymous HyperlinkTargets
                // Anonymous HyperlinkRefs with embeded e.g. `example <url>`__ directly reference its target and we don't need any special treatment
                if (!hyperlinkRef.isAnonymous || hyperlinkRef.isEmbeded) {
                    return {
                        target: hyperlinkRef.target,
                        isAlias: hyperlinkRef.isAlias,
                    }
                }

                const currRefIdx = anonymousRefIdx
                const hyperlinkTarget = anonymousTargets.at(currRefIdx)
                if (!hyperlinkTarget) {
                    return null
                }

                anonymousRefIdx += 1
                return resolveHyperlinkTarget(hyperlinkTarget)
            }

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

        const registerTargetableHyperlinkRefs = () => {
            for (const hyperlinkRef of hyperlinkRefs) {
                // Explicitly named HyperlinkRef that links elsewhere can be referenced by their label
                // e.g. `somelabel <url not same as label>`_ can be referenced by somelabel_
                if (!hyperlinkRef.isEmbeded) {
                    continue
                }

                // When embeded has label===target, it means there's no label e.g. `<url>`_
                // Thus this cannot be targeted by other HyperlinkRefs
                if (hyperlinkRef.label === hyperlinkRef.target) {
                    continue
                }

                const candidateTargetName = normalizeSimpleName(hyperlinkRef.label)
                if (this._simpleNameToTarget.has(candidateTargetName)) {
                    continue
                }

                this.registerNodeForwardTarget(candidateTargetName, {
                    target: hyperlinkRef.target,
                    isAlias: hyperlinkRef.isAlias,
                })
            }
        }

        registerHyperlinkTargets()
        registerInlineInternalTargets()
        registerHyperlinkRefs()
        registerTargetableHyperlinkRefs()
    }
}
