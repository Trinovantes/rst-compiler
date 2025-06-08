import { Brand } from '@/@types/Brand.js'
import { RstCitationDef } from '@/RstNode/ExplicitMarkup/CitationDef.js'
import { RstFootnoteDef } from '@/RstNode/ExplicitMarkup/FootnoteDef.js'
import { RstHyperlinkTarget } from '@/RstNode/ExplicitMarkup/HyperlinkTarget.js'
import { RstCitationRef } from '@/RstNode/Inline/CitationRef.js'
import { RstFootnoteRef } from '@/RstNode/Inline/FootnoteRef.js'
import { RstInlineInternalTarget } from '@/RstNode/Inline/InlineInternalTarget.js'
import { RstNode } from '@/RstNode/RstNode.js'
import { SimpleName, normalizeSimpleName } from '@/SimpleName.js'
import { RstCompiler } from '@/RstCompiler.js'
import { HtmlAttrResolver } from './HtmlAttrResolver.js'
import { RstDocument } from '@/RstNode/Block/Document.js'
import { RstSection } from '@/RstNode/Block/Section.js'
import { RstHyperlinkRef } from '@/RstNode/Inline/HyperlinkRef.js'
import { trimCommonIndent } from '@/utils/trimCommonIndent.js'

type FootnoteLabelNum = Brand<number, 'FootnoteLabelNum'> // For identifying/referencing footnote in document
type FootnoteSymNum = Brand<number, 'FootnoteSymNum'> // For determining which symbol to render

// ------------------------------------------------------------------------
// MARK: SimpleNameResolver
// ------------------------------------------------------------------------

/**
 * Caches data that need to be filled after parsing
 *
 * Data in this container class is consumed by RstGeneratorState
 */
export class SimpleNameResolver {
    private readonly _compiler: RstCompiler
    private readonly _htmlAttrResolver: HtmlAttrResolver
    private readonly _root: RstDocument

    private readonly _nodesLinkableFromOutside = new Map<SimpleName, RstNode>() // Other Documents can use these SimpleNames to reference a node inside this Document
    private readonly _explicitSimpleNames = new Map<SimpleName, RstNode>()
    private readonly _explicitNodes = new Map<RstNode, SimpleName>()
    private readonly _implicitSimpleNames = new Map<SimpleName, RstNode>()
    private readonly _implicitNodes = new Map<RstNode, SimpleName>()

    private readonly _footnoteDefToLabelNum = new Map<RstFootnoteDef, FootnoteLabelNum>()
    private readonly _footnoteDefToSymNum = new Map<RstFootnoteDef, FootnoteSymNum>()
    private readonly _footnoteDefBacklinks = new Map<RstFootnoteDef, Array<RstFootnoteRef>>()
    private readonly _footnoteRefToDef = new Map<RstFootnoteRef, RstFootnoteDef>()
    private readonly _citationDefBacklinks = new Map<RstCitationDef, Array<RstCitationRef>>()
    private readonly _citationRefToDef = new Map<RstCitationRef, RstCitationDef>()
    private readonly _anonymousHyperlinkRefToTarget = new Map<RstHyperlinkRef, RstHyperlinkTarget>()

    constructor(
        compiler: RstCompiler,
        htmlAttrResolver: HtmlAttrResolver,
        root: RstDocument,
    ) {
        this._compiler = compiler
        this._htmlAttrResolver = htmlAttrResolver
        this._root = root

        this.processSections()
        this.processFootnotes()
        this.processCitations()
        this.processHyperlinks()
    }

    get nodesLinkableFromOutside(): ReadonlyMap<SimpleName, RstNode> {
        return this._nodesLinkableFromOutside
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

    get anonymousHyperlinkRefToTarget(): ReadonlyMap<RstHyperlinkRef, RstHyperlinkTarget> {
        return this._anonymousHyperlinkRefToTarget
    }

    // ------------------------------------------------------------------------
    // MARK: SimpleName
    // ------------------------------------------------------------------------

    getSimpleName(node: RstNode): SimpleName {
        for (const plugin of this._compiler.plugins) {
            const simpleName = plugin.getSimpleName?.(node)
            if (simpleName) {
                return simpleName
            }
        }

        const simpleName = this._explicitNodes.get(node) ?? this._implicitNodes.get(node)
        if (!simpleName) {
            throw new Error(`Failed to getSimpleName for [${node.toShortString()}]`)
        }

        return simpleName
    }

    private getSimpleNameCandidate(node: RstNode, forceUnique = false): SimpleName {
        let simpleName = (() => {
            if (node instanceof RstSection) {
                return normalizeSimpleName(node.textContent)
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

                throw new Error(`Failed to getSimpleNameCandidate for [${node.toShortString()}]`)
            }

            if (node instanceof RstCitationDef) {
                return normalizeSimpleName(node.label)
            }

            if (node instanceof RstHyperlinkTarget) {
                return node.isAnonymous
                    ? normalizeSimpleName(`anonymous-${node.nodeType}-${node.nthOfType}`)
                    : normalizeSimpleName(node.label)
            }

            if (node instanceof RstInlineInternalTarget) {
                return normalizeSimpleName(node.textContent)
            }

            return normalizeSimpleName(`${node.nodeType}-${node.nthOfType}`)
        })()

        if (forceUnique) {
            let counter = 1
            while (this._explicitSimpleNames.has(simpleName) || this._implicitSimpleNames.has(simpleName)) {
                simpleName = normalizeSimpleName(`${simpleName}-${counter}`)
                counter += 1
            }
        }

        return simpleName
    }

    // ------------------------------------------------------------------------
    // MARK: Registrations
    // ------------------------------------------------------------------------

    registerExplicitNode(node: RstNode, simpleName: SimpleName): void {
        const existingTargetedNode = this._explicitSimpleNames.get(simpleName)
        if (existingTargetedNode && !existingTargetedNode.equals(node)) {
            throw new Error(trimCommonIndent(`
                SimpleName:"${simpleName}" already exists
                    new: [${node.toShortString()}] (${node.lineNums})
                    old: [${existingTargetedNode.toShortString()}] (${existingTargetedNode.lineNums})
            `))
        }

        this._explicitSimpleNames.set(simpleName, node)
        this._explicitNodes.set(node, simpleName)
    }

    registerImplicitNode(node: RstNode, simpleName: SimpleName): void {
        this._implicitSimpleNames.set(simpleName, node)
        this._implicitNodes.set(node, simpleName)
    }

    registerNodeAsLinkable(node: RstNode, idAttr: SimpleName, linkableFromOutside = true): void {
        this._htmlAttrResolver.registerNodeAsLinkable(node, idAttr)

        if (linkableFromOutside) {
            const existingTargetedNode = this._nodesLinkableFromOutside.get(idAttr)
            const existingTargetedNodeIsExplict = existingTargetedNode && this._explicitNodes.has(existingTargetedNode)
            if (existingTargetedNodeIsExplict) {
                throw new Error(trimCommonIndent(`
                    id:"${idAttr}" already exists
                        new: [${node.toShortString()}] (${node.lineNums})
                        old: [${existingTargetedNode.toShortString()}] (${existingTargetedNode.lineNums})
                `))
            }

            this._nodesLinkableFromOutside.set(idAttr, node)
        }
    }

    // ------------------------------------------------------------------------
    // MARK: Node: Sections
    // ------------------------------------------------------------------------

    private processSections() {
        const sections = this._root.findAllChildren('Section')

        for (const section of sections) {
            const simpleName = this.getSimpleNameCandidate(section, true)
            this.registerImplicitNode(section, simpleName)
            this.registerNodeAsLinkable(section, simpleName)
        }
    }

    // ------------------------------------------------------------------------
    // MARK: Node: Footnote
    // ------------------------------------------------------------------------

    private processFootnotes() {
        const footnoteDefs = this._root.findAllChildren('FootnoteDef')
        const footnoteRefs = this._root.findAllChildren('FootnoteRef')

        const registerAutoLabelNums = () => {
            const usedLabelNums = new Set<number>()
            let autoLabelNumCounter = 1
            const getNextLabelNum = (): number => {
                while (usedLabelNums.has(autoLabelNumCounter)) {
                    autoLabelNumCounter++
                }
                return autoLabelNumCounter
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
            // Must be done last because this rely on getCandidateSimpleName that is dependant on resolved AutoLabelNums and AutoSymbols
            for (const node of [...footnoteDefs, ...footnoteRefs]) {
                const simpleName = this.getSimpleNameCandidate(node, true)
                this.registerImplicitNode(node, simpleName)
                this.registerNodeAsLinkable(node, simpleName, false)
            }
        }

        registerAutoLabelNums()
        registerAutoSymbols()
        registerBacklinks()
        registerFootnotes()
    }

    // ------------------------------------------------------------------------
    // MARK: Node: Citation
    // ------------------------------------------------------------------------

    private processCitations() {
        const citationDefs = this._root.findAllChildren('CitationDef')
        const citationRefs = this._root.findAllChildren('CitationRef')

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
                const simpleName = this.getSimpleNameCandidate(node, true)
                this.registerImplicitNode(node, simpleName)
                this.registerNodeAsLinkable(node, simpleName, false)
            }
        }

        registerCitationBacklinks()
        registerCitations()
    }

    // ------------------------------------------------------------------------
    // MARK: Node: Hyperlink
    // ------------------------------------------------------------------------

    resolveSimpleName(simpleName: SimpleName): RstNode | null {
        return this._explicitSimpleNames.get(simpleName) ?? this._implicitSimpleNames.get(simpleName) ?? null
    }

    resolveIndirectHyperlinkTarget(hyperlinkTarget: RstHyperlinkTarget): RstNode | null {
        if (!hyperlinkTarget.isTargetingNextNode) {
            return null
        }

        let currNode: RstNode | null = hyperlinkTarget

        // Follow the chain to find an visible node
        while (true) {
            currNode = currNode?.getNextNodeInTree() ?? null

            if (!currNode) {
                return null
            }

            if (currNode instanceof RstHyperlinkTarget && !currNode.isTargetingNextNode) {
                return currNode
            }

            if (!(currNode instanceof RstHyperlinkTarget) && currNode.willRenderVisibleContent) {
                return currNode
            }
        }
    }

    private processHyperlinks() {
        const hyperlinkTargets = this._root.findAllChildren('HyperlinkTarget')
        const inlineInternalTargets = this._root.findAllChildren('InlineInternalTarget')
        const hyperlinkRefs = this._root.findAllChildren('HyperlinkRef')

        const registerHyperlinkTargets = () => {
            for (const hyperlinkTarget of hyperlinkTargets) {
                const simpleName = this.getSimpleNameCandidate(hyperlinkTarget)
                this.registerExplicitNode(hyperlinkTarget, simpleName)

                const indirectTarget = this.resolveIndirectHyperlinkTarget(hyperlinkTarget)
                if (indirectTarget) {
                    // Register the indirect target with the HyperlinkTarget's SimpleName so that it gets HyperlinkTarget's text for its id
                    //
                    // e.g.
                    //      .. _Documentation:
                    //      This paragraph will be generated with <p id="documentation">
                    //
                    this.registerNodeAsLinkable(indirectTarget, simpleName)
                }
            }
        }

        const registerInlineInternalTargets = () => {
            for (const inlineTarget of inlineInternalTargets) {
                const simpleName = this.getSimpleNameCandidate(inlineTarget)
                this.registerExplicitNode(inlineTarget, simpleName)
                this.registerNodeAsLinkable(inlineTarget, simpleName)
            }
        }

        const registerLinkableHyperlinkRefs = () => {
            for (const hyperlinkRef of hyperlinkRefs) {
                // Explicitly-named embeded HyperlinkRef that links elsewhere can be referenced by their label
                // e.g. `somelabel <url not same as label>`_ can be referenced by somelabel_
                if (!hyperlinkRef.isEmbeded) {
                    continue
                }

                // When embeded has label===target, it means there's no label e.g. `<url>`_
                // Thus this cannot be targeted by other HyperlinkRefs
                if (hyperlinkRef.label === hyperlinkRef.target) {
                    continue
                }

                // If SimpleName already exists (e.g. another HyperlinkTarget) then this HyperlinkRef cannot be targeted
                const candidateSimpleName = normalizeSimpleName(hyperlinkRef.label)
                if (this._explicitSimpleNames.has(candidateSimpleName) || this._implicitSimpleNames.has(candidateSimpleName)) {
                    continue
                }

                this.registerImplicitNode(hyperlinkRef, candidateSimpleName)
            }
        }

        const registerAnonymousHyperlinkRefs = () => {
            const anonymousRefs = hyperlinkRefs.filter((ref) => ref.isAnonymous)
            const anonymousTargets = hyperlinkTargets.filter((target) => target.isAnonymous)

            for (let i = 0; i < anonymousRefs.length && i < anonymousTargets.length; i++) {
                const ref = anonymousRefs[i]
                const target = anonymousTargets[i]
                this._anonymousHyperlinkRefToTarget.set(ref, target)
            }
        }

        registerHyperlinkTargets()
        registerInlineInternalTargets()
        registerLinkableHyperlinkRefs()
        registerAnonymousHyperlinkRefs()
    }
}
