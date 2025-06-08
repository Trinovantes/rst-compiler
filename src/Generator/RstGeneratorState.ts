import { normalizeSimpleName, SimpleName } from '../SimpleName.js'
import { RstNode } from '@/RstNode/RstNode.js'
import { convertUnicode } from '@/utils/convertUnicode.js'
import { RstDirective } from '@/RstNode/ExplicitMarkup/Directive.js'
import { RstInterpretedText } from '@/RstNode/Inline/InterpretedText.js'
import { RstGeneratorOptions } from './RstGeneratorOptions.js'
import { RstCompiler } from '@/RstCompiler.js'
import { SubstitutionResolver } from '@/Parser/Resolver/SubstitutionResolver.js'
import { HtmlAttrResolver } from '@/Parser/Resolver/HtmlAttrResolver.js'
import { RstDocument } from '@/RstNode/Block/Document.js'
import { RstNodeGenerator } from './RstGenerator.js'
import { FilePathWithoutRst, getFilePathWithoutRst } from './FilePathWithoutRst.js'
import { RstSection } from '@/RstNode/Block/Section.js'
import { HtmlAttributeStore } from './HtmlAttributeStore.js'
import { RstGeneratorError } from './RstGeneratorError.js'
import { sha1 } from '@/utils/sha1.js'
import { SimpleNameResolver } from '@/Parser/Resolver/SimpleNameResolver.js'
import { RstFootnoteDef } from '@/RstNode/ExplicitMarkup/FootnoteDef.js'
import { RstFootnoteRef } from '@/RstNode/Inline/FootnoteRef.js'
import { RstParserOutput } from '@/Parser/RstParserState.js'
import { RstCitationRef } from '@/RstNode/Inline/CitationRef.js'
import { RstCitationDef } from '@/RstNode/ExplicitMarkup/CitationDef.js'
import { getAutoFootnoteSymbol } from '@/utils/getAutoFootnoteSymbol.js'
import { getPathDirname, joinFilePath, normalizeFilePath, resolveFilePath } from '@/utils/path.js'
import { RstHyperlinkTarget } from '@/RstNode/ExplicitMarkup/HyperlinkTarget.js'
import { RstHyperlinkRef } from '@/RstNode/Inline/HyperlinkRef.js'

export type RstGeneratorInput = {
    basePath: string // Base url all pages will be deployed to (default /)
    currentDocPath: string
    docs: Array<{
        docPath: string // docPath is relative to basePath
        parserOutput: RstParserOutput
    }>
}

export type RstGeneratorOutput = {
    body: string
    header: string
    downloads: Array<{
        srcPath: string
        destPath: string
    }>
}

type LinePrefix = {
    val: string
    replacementAfterOnce?: string
}

type OutputBuffer = {
    textOutput: string
    prefixes: Array<LinePrefix>
}

type VisitChildren = () => void

export class RstGeneratorState {
    readonly opts: RstGeneratorOptions

    private readonly _generatorInput: Readonly<RstGeneratorInput>
    private readonly _compiler: RstCompiler
    private readonly _basePath: FilePathWithoutRst
    private readonly _currentDocPath: FilePathWithoutRst
    private readonly _currentParserOutput: RstParserOutput
    private readonly _docsCache: ReadonlyMap<FilePathWithoutRst, RstParserOutput>
    private readonly _simpleNameCache: ReadonlyMap<SimpleName, FilePathWithoutRst>

    private _globalHeaderBuffer = new Map<string, string>() // Content to write to top of output e.g. <script> <link> (indexed by string key so multiple nodes don't output the same content)
    private _downloads = new Map<string, string>() // Maps source of download file (relative to basePath) to expected location to be served
    private _outputBuffers: Array<OutputBuffer> = [
        {
            textOutput: '',
            prefixes: [],
        },
    ]

    private _enableUnicodeConversion = false
    private _enableForcedHtmlMode = false // Some constructs cannot be represented in Markdown so we switch to outputting html recursively as fallback
    private _disableLineBreaksBetweenBlocks = false
    private _disableCommentMarkup = false // So we don't write comment markup inside a parent comment

    constructor(
        opts: RstGeneratorOptions,
        generatorInput: RstGeneratorInput,
        compiler: RstCompiler,
    ) {
        this.opts = opts
        this._generatorInput = generatorInput
        this._compiler = compiler

        if (!this._generatorInput.basePath.startsWith('/') || !this._generatorInput.basePath.endsWith('/')) {
            throw new Error(`basePath:"${this._generatorInput.basePath}" must start and end with "/"`)
        }

        const currentDoc = this._generatorInput.docs.find(({ docPath }) => docPath === this._generatorInput.currentDocPath)
        if (!currentDoc) {
            throw new Error(`Failed to find "${this._generatorInput.currentDocPath}" in generatorInput.docs`)
        }

        this._basePath = getFilePathWithoutRst(normalizeFilePath(this._generatorInput.basePath))
        this._currentDocPath = getFilePathWithoutRst(joinFilePath(this._basePath, currentDoc.docPath))
        this._currentParserOutput = currentDoc.parserOutput

        this._docsCache = new Map(this._generatorInput.docs.map(({ docPath, parserOutput }) => {
            const absPath = getFilePathWithoutRst(joinFilePath(this._basePath, docPath))
            return [absPath, parserOutput]
        }))
        this._simpleNameCache = new Map(this._generatorInput.docs.flatMap(({ docPath, parserOutput }) => {
            const names = [...parserOutput.simpleNameResolver.nodesLinkableFromOutside.keys()]
            const absPath = getFilePathWithoutRst(joinFilePath(this._basePath, docPath))
            return names.map((name) => [name, absPath])
        }))

        this.visitNode(this._currentParserOutput.root)
    }

    // ------------------------------------------------------------------------
    // MARK: Getters
    // ------------------------------------------------------------------------

    get root(): RstDocument {
        return this._currentParserOutput.root
    }

    get generatorOutput(): RstGeneratorOutput {
        if (this._outputBuffers.length !== 1) {
            throw new RstGeneratorError(this, 'Corrupt outputBuffer')
        }

        const body = this._outputBuffers[0].textOutput
        const header = [...this._globalHeaderBuffer.values()].join('\n')
        const downloads = [...this._downloads.entries()].map(([srcPath, destPath]) => ({ srcPath, destPath }))

        return {
            body,
            header,
            downloads,
        }
    }

    get debugInfo(): string {
        let str = ''

        str += `\n  basePath        : "${this._basePath}"`
        str += `\n    resolved from : "${this._generatorInput.basePath}"`

        str += `\n  currentDocPath  : "${this._currentDocPath}"`
        str += `\n    resolved from : "${this._generatorInput.currentDocPath}"`

        return str
    }

    get simpleNameResolver(): SimpleNameResolver {
        return this._currentParserOutput.simpleNameResolver
    }

    get substitutionResolver(): SubstitutionResolver {
        return this._currentParserOutput.substitutionResolver
    }

    get htmlAttrResolver(): HtmlAttrResolver {
        return this._currentParserOutput.htmlAttrResolver
    }

    // ------------------------------------------------------------------------
    // MARK: Resolvers
    // ------------------------------------------------------------------------

    resolveExternalDoc(srcNode: RstNode, targetPath: string): { externalUrl: string; externalLabel?: string } {
        const docFilePath = targetPath.startsWith('/')
            ? joinFilePath(this._basePath, targetPath) // If given abs path, assume we want to search from basePath
            : resolveFilePath(getPathDirname(this._currentDocPath), targetPath) // Otherwise, assume we want to search relative from current doc

        const docPath = getFilePathWithoutRst(docFilePath)
        const externalUrl = `${docPath}.html`

        const parserOutput = this._docsCache.get(docPath)
        if (!parserOutput) {
            throw new RstGeneratorError(this, srcNode, `targetPath:"${docPath}" (resolved from "${targetPath}") not found`)
        }

        const firstSection = parserOutput.root.findFirstChild('Section')
        const externalLabel = firstSection?.textContent

        return {
            externalUrl,
            externalLabel,
        }
    }

    canResolveExternalRef(targetRef: SimpleName): boolean {
        return this._simpleNameCache.has(targetRef)
    }

    resolveExternalRef(srcNode: RstNode, targetRef: SimpleName): { externalUrl: string; externalLabel?: string } {
        const docPath = this._simpleNameCache.get(targetRef)
        if (!docPath) {
            throw new RstGeneratorError(this, srcNode, `Failed to resolveExternalRef "${targetRef}"`)
        }

        const parserOutput = this._docsCache.get(docPath)
        if (!parserOutput) {
            throw new RstGeneratorError(this, srcNode, `Failed to resolveExternalRef "${targetRef}"`)
        }

        const targetNode = parserOutput.simpleNameResolver.nodesLinkableFromOutside.get(targetRef)
        if (!targetNode) {
            throw new RstGeneratorError(this, srcNode, `Failed to resolveExternalRef "${targetRef}"`)
        }

        const nodeIdAttr = parserOutput.htmlAttrResolver.getNodeHtmlId(targetNode)
        if (!nodeIdAttr) {
            throw new RstGeneratorError(this, srcNode, `Failed to resolveExternalRef "${targetRef}"`)
        }

        const externalUrl = docPath === this._currentDocPath
            ? `#${nodeIdAttr}`
            : `${docPath}#${nodeIdAttr}`

        const externalLabel = (targetNode instanceof RstSection)
            ? targetNode.textContent
            : undefined

        return {
            externalUrl,
            externalLabel,
        }
    }

    resolveHyperlinkRefToUrl(node: RstHyperlinkRef): string {
        if (node.isAnonymous && !node.isEmbeded) {
            const anonymousHyperlinkTarget = this.simpleNameResolver.anonymousHyperlinkRefToTarget.get(node)
            if (!anonymousHyperlinkTarget) {
                throw new RstGeneratorError(this, `Failed to resolve [${node.toShortString()}] (${node.lineNums})`)
            }

            return this.resolveNodeToUrl(anonymousHyperlinkTarget)
        }

        // HyperlinkRef can be written without space between label and angle brackets
        // - Some expect the angle brackets to contain the target url
        // - Others expect the whole string as label
        // Thus we need to test both cases
        if (node.isEmbeded) {
            const candidateSimpleName = normalizeSimpleName(`${node.label}<${node.target}>`)
            const candidateUrl = this.resolveSimpleNameToUrl(candidateSimpleName)
            if (candidateUrl) {
                return candidateUrl
            }
        }

        const targetSimpleName = normalizeSimpleName(node.target)
        const targetUrl = this.resolveSimpleNameToUrl(targetSimpleName)
        if (targetUrl) {
            return targetUrl
        }

        return node.target
    }

    resolveNodeToUrl(node: RstNode): string {
        const simpleName = this.simpleNameResolver.getSimpleName(node)
        const url = this.resolveSimpleNameToUrl(simpleName)
        if (!url) {
            throw new RstGeneratorError(this, node, 'Failed to resolveNodeToUrl')
        }

        return url
    }

    resolveSimpleNameToUrl(simpleName: SimpleName): string | null {
        const seenNodes = new Set<RstNode>() // To avoid cyclic nodes causing infinite loops
        let currNode: RstNode | null = this.simpleNameResolver.resolveSimpleName(simpleName)

        while (currNode && !seenNodes.has(currNode)) {
            seenNodes.add(currNode)

            if (currNode instanceof RstHyperlinkTarget) {
                if (currNode.isAlias) {
                    // HyperlinkTarget aliasing another node is defined to have trailing underscore
                    currNode = this.simpleNameResolver.resolveSimpleName(normalizeSimpleName(currNode.target.substring(0, currNode.target.length - 1)))
                    continue
                }
                if (currNode.isTargetingNextNode) {
                    currNode = this.simpleNameResolver.resolveIndirectHyperlinkTarget(currNode)
                    continue
                }

                return currNode.target
            }

            if (currNode instanceof RstHyperlinkRef) {
                if (currNode.isAlias) {
                    if (currNode.isEmbeded) {
                        // HyperlinkRef aliasing another node inside an embeded is defined to have trailing underscore (e.g. `label <target_>`_)
                        currNode = this.simpleNameResolver.resolveSimpleName(normalizeSimpleName(currNode.target.substring(0, currNode.target.length - 1)))
                    } else {
                        // Otherwise the target is treated as the entire alias name (e.g. `target`_)
                        currNode = this.simpleNameResolver.resolveSimpleName(normalizeSimpleName(currNode.target))
                    }

                    continue
                }

                return currNode.target
            }

            const idAttr = this.htmlAttrResolver.getNodeHtmlId(currNode)
            if (!idAttr) {
                throw new RstGeneratorError(this, currNode, `Resolved SimpleName:"${simpleName}" to [${currNode.toShortString()}] but it is not marked as linkable in HtmlAttrResolver`)
            }

            return `#${idAttr}`
        }

        return null
    }

    resolveCitationDef(citationRef: RstCitationRef): RstCitationDef {
        const citationDef = this.simpleNameResolver.citationRefToDef.get(citationRef)
        if (!citationDef) {
            throw new RstGeneratorError(this, citationRef, 'Failed to resolveCitationDef')
        }

        return citationDef
    }

    resolveCitationDefBacklinks(citationDef: RstCitationDef): Array<string> {
        const refs = this.simpleNameResolver.citationDefBacklinks.get(citationDef) ?? []
        return refs.map((citationRef) => this.resolveNodeToUrl(citationRef))
    }

    resolveFootnoteDef(footnoteRef: RstFootnoteRef): RstFootnoteDef {
        const footnoteDef =  this.simpleNameResolver.footnoteRefToDef.get(footnoteRef)
        if (!footnoteDef) {
            throw new RstGeneratorError(this, footnoteRef, 'Failed to resolveFootnoteDef')
        }

        return footnoteDef
    }

    resolveFootnoteDefBacklinks(footnoteDef: RstFootnoteDef): Array<string> {
        const footnoteRefs = this.simpleNameResolver.footnoteDefBacklinks.get(footnoteDef) ?? []
        return footnoteRefs.map((footnoteRef) => this.resolveNodeToUrl(footnoteRef))
    }

    resolveFootnoteDefLabel(footnoteDef: RstFootnoteDef): string {
        if (footnoteDef.isAutoSymbol) {
            const symNum = this.simpleNameResolver.footnoteDefToSymNum.get(footnoteDef)
            if (!symNum) {
                throw new RstGeneratorError(this, footnoteDef, 'Failed to resolveFootnoteDefLabel')
            }

            return getAutoFootnoteSymbol(symNum)
        }

        const labelNum = this.simpleNameResolver.footnoteDefToLabelNum.get(footnoteDef)
        if (!labelNum) {
            throw new RstGeneratorError(this, footnoteDef, 'Failed to resolveFootnoteDefLabel')
        }

        return labelNum.toString()
    }

    resolveFootnoteRefLabel(footnoteRef: RstFootnoteRef): string {
        const footnoteDef = this.simpleNameResolver.footnoteRefToDef.get(footnoteRef)
        if (!footnoteDef) {
            throw new RstGeneratorError(this, footnoteRef, 'Failed to resolveFootnoteRefLabel')
        }

        return this.resolveFootnoteDefLabel(footnoteDef)
    }

    // ------------------------------------------------------------------------
    // MARK: Visit
    // ------------------------------------------------------------------------

    visitNode(node?: RstNode | null) {
        if (!node) {
            return
        }

        const handleNode = () => {
            switch (true) {
                case node instanceof RstInterpretedText: {
                    const generator = this._compiler.interpretedTextGenerators.get(node.role.toLowerCase())
                    if (!generator) {
                        throw new RstGeneratorError(this, node, 'Missing generator')
                    }

                    generator.generate(this, node)
                    break
                }

                case node instanceof RstDirective: {
                    const generator = this._compiler.directiveGenerators.get(node.directive.toLowerCase())
                    if (!generator) {
                        throw new RstGeneratorError(this, node, 'Missing generator')
                    }

                    generator.generate(this, node)
                    break
                }

                default: {
                    const generator = this._compiler.nodeGenerators.get(node.nodeType)
                    if (!generator) {
                        throw new RstGeneratorError(this, node, 'Missing generator')
                    }

                    // Really ugly way to get types to work
                    (generator as RstNodeGenerator<'Document'>).generate(this, node as RstDocument)
                }
            }
        }

        if (this.htmlAttrResolver.hasForcedHtmlClass(node)) {
            this.useForcedHtmlMode(() => {
                handleNode()
            })
        } else {
            handleNode()
        }
    }

    visitNodes(nodes: ReadonlyArray<RstNode>): void {
        if (nodes.length === 0) {
            return
        }

        const allNodesAreBlock = nodes.every((node) => !node.isInlineNode)

        for (const [idx, child] of nodes.entries()) {
            this.visitNode(child)

            const notLastChild = idx < nodes.length - 1
            if (!this.isUsingNoLineBreaksBetweenBlocks && allNodesAreBlock && notLastChild) {
                this.writeLine()
            }
        }
    }

    // ------------------------------------------------------------------------
    // MARK: LinePrefix
    // ------------------------------------------------------------------------

    private get _currentBuffer(): OutputBuffer {
        return this._outputBuffers[this._outputBuffers.length - 1]
    }

    hasLinePrefix(): boolean {
        return this._currentBuffer.prefixes.length > 0
    }

    private getAndUpdateLinePrefix(): string {
        const linePrefix = this._currentBuffer.prefixes.map((prefix) => prefix.val).join('')

        // Update prefixes after reading them in this getter
        // Some prefixes want to only be used once
        //
        // e.g.
        //
        //      1. Bullet list
        //         Second line
        //      ^^
        //      |
        //      On second line, the "1. " prefix got replaced with "  " after it is consumed once
        //

        this._currentBuffer.prefixes = (() => {
            const newPrefixes = new Array<LinePrefix>()

            for (const prefix of this._currentBuffer.prefixes) {
                if (prefix.replacementAfterOnce) {
                    newPrefixes.push({
                        val: prefix.replacementAfterOnce,
                    })
                } else {
                    newPrefixes.push({
                        val: prefix.val,
                    })
                }
            }

            return newPrefixes
        })()

        return linePrefix
    }

    usePrefix(prefix: LinePrefix, visitChildren: VisitChildren) {
        this._currentBuffer.prefixes.push(prefix)

        visitChildren()

        const expectedPrefix = prefix.replacementAfterOnce ?? prefix.val
        const popped = this._currentBuffer.prefixes.pop()
        if (popped?.val !== expectedPrefix) {
            throw new RstGeneratorError(this, `Invalid prefix popped off stack expected:"${expectedPrefix}" actual:"${popped?.val}"`)
        }
    }

    useIndent(visitChildren: VisitChildren) {
        this.usePrefix({ val: ' '.repeat(this.opts.outputIndentSize) }, visitChildren)
    }

    useNodeGenerator(nodeGenerator: RstNodeGenerator, visitChildren: VisitChildren) {
        const nodeType = nodeGenerator.nodeType
        const prevNodeGenerator = this._compiler.nodeGenerators.get(nodeType)

        this._compiler.nodeGenerators.set(nodeType, nodeGenerator)
        visitChildren()

        if (prevNodeGenerator) {
            this._compiler.nodeGenerators.set(nodeType, prevNodeGenerator)
        } else {
            this._compiler.nodeGenerators.delete(nodeType)
        }
    }

    // ------------------------------------------------------------------------
    // MARK: Write Flags
    // ------------------------------------------------------------------------

    useUnicodeConversion(visitChildren: VisitChildren): void {
        const alreadyEnabled = this._enableUnicodeConversion

        if (!alreadyEnabled) {
            this._enableUnicodeConversion = true
        }

        visitChildren()

        if (!alreadyEnabled) {
            this._enableUnicodeConversion = false
        }
    }

    get isUsingUnicodeConversion(): boolean {
        return this._enableUnicodeConversion
    }

    useForcedHtmlMode(visitChildren: VisitChildren) {
        const alreadyEnabled = this._enableForcedHtmlMode

        if (!alreadyEnabled) {
            this._enableForcedHtmlMode = true
        }

        // Markdown does not support html with linebreaks
        this.useNoLineBreaksBetweenBlocks(visitChildren)

        if (!alreadyEnabled) {
            this._enableForcedHtmlMode = false
        }
    }

    get isUsingForcedHtmlMode(): boolean {
        return this._enableForcedHtmlMode
    }

    useNoLineBreaksBetweenBlocks(visitChildren: VisitChildren) {
        const alreadyDisabled = this._disableLineBreaksBetweenBlocks

        if (!alreadyDisabled) {
            this._disableLineBreaksBetweenBlocks = true
        }

        visitChildren()

        if (!alreadyDisabled) {
            this._disableLineBreaksBetweenBlocks = false
        }
    }

    get isUsingNoLineBreaksBetweenBlocks(): boolean {
        return this._disableLineBreaksBetweenBlocks
    }

    useNoCommentMarkup(visitChildren: VisitChildren) {
        const alreadyDisabled = this._disableCommentMarkup

        if (!alreadyDisabled) {
            this._disableCommentMarkup = true
        }

        visitChildren()

        if (!alreadyDisabled) {
            this._disableCommentMarkup = false
        }
    }

    get isUsingNoCommentMarkup(): boolean {
        return this._disableCommentMarkup
    }

    // ------------------------------------------------------------------------
    // MARK: Alt Writers
    // ------------------------------------------------------------------------

    registerGlobalHeader(key: string, text: string) {
        this._globalHeaderBuffer.set(key, text)
    }

    registerDownload(targetPath: string) {
        const downloadSrc = targetPath.startsWith('/')
            ? joinFilePath(this._basePath, targetPath) // If given abs path, assume we want to search from basePath
            : resolveFilePath(getPathDirname(this._currentDocPath), targetPath) // Otherwise, assume we want to search relative from current doc

        const fileHash = sha1(downloadSrc)
        const fileName = downloadSrc.split('/').at(-1) ?? downloadSrc
        const downloadDest = joinFilePath(this._basePath, '_downloads', fileHash, fileName)

        this._downloads.set(downloadSrc, downloadDest)

        return {
            downloadSrc,
            downloadDest,
            fileName,
        }
    }

    // ------------------------------------------------------------------------
    // MARK: Writers
    // ------------------------------------------------------------------------

    getChildrenText(visitChildren: VisitChildren): string {
        this._outputBuffers.push({
            textOutput: '',
            prefixes: [],
        })

        visitChildren()

        const lastBuffer = this._outputBuffers.pop()
        if (!lastBuffer) {
            throw new RstGeneratorError(this, 'Invalid lastBuffer')
        }

        let bodyText = lastBuffer.textOutput
        bodyText = bodyText.replace(/^\n+/, '') // Remove all newlines at start
        bodyText = bodyText.replace(/\n+$/, '') // Remove all newlines at end
        return bodyText
    }

    writeText(text: string) {
        const len = this._outputBuffers.length
        if (len < 1) {
            throw new RstGeneratorError(this, 'Invalid lastBuffer')
        }

        if (this._enableUnicodeConversion) {
            text = convertUnicode(text)
        }

        this._outputBuffers[len - 1].textOutput += text
    }

    writeTextWithLinePrefix(text: string) {
        this.writeText(text.replaceAll('\n', () => '\n' + this.getAndUpdateLinePrefix()))
    }

    writeLine(text?: string | null) {
        let line = ''

        if (text) {
            line += this.getAndUpdateLinePrefix()
            line += text.replaceAll(/\n(?!\n)/g, () => '\n' + this.getAndUpdateLinePrefix())
        } else {
            line += this.getAndUpdateLinePrefix().trimEnd()
        }

        this.writeText(line + '\n')
    }

    writeLineVisitor(visitChildren: VisitChildren) {
        this.writeText(this.getAndUpdateLinePrefix())
        visitChildren()
        this.writeText('\n')
    }

    // VitePress uses `markdown-it-container` for custom block-level container
    // When nesting containers, we need the outer blocks to have more colons than the inner containers
    //
    //      :::::: outer
    //      ::: inner
    //      Content
    //      :::
    //      ::::::
    //
    writeLineMdContainer(label: string, root: RstNode, visitChildren: VisitChildren): void {
        const getMaxMdContainerDepth = (node: RstNode): number => {
            const selfIsMdContainer = node instanceof RstDirective && this.opts.directivesWillOutputMdContainers.includes(node.directive)

            let maxChildMdContainerDepth = 0
            for (const child of node.children) {
                maxChildMdContainerDepth = Math.max(maxChildMdContainerDepth, getMaxMdContainerDepth(child))
            }

            return maxChildMdContainerDepth + (selfIsMdContainer ? 1 : 0)
        }

        const numNestedContainers = getMaxMdContainerDepth(root)
        const dots = ':::'.repeat(numNestedContainers)

        this.writeLine(`${dots} ${label}`)
        visitChildren()
        this.writeLine(dots)
    }

    writeLineHtmlTag(tag: string, node: RstNode | null, visitChildren?: VisitChildren): void {
        this.writeLineHtmlTagWithAttr(tag, node, new HtmlAttributeStore(), visitChildren)
    }

    writeLineHtmlTagWithAttr(tag: string, node: RstNode | null, attrs: HtmlAttributeStore, visitChildren?: VisitChildren): void {
        const isSelfClosing = (visitChildren === undefined)

        this.writeLineVisitor(() => {
            this.writeTextHtmlTagStart(tag, node, attrs, isSelfClosing)
        })

        if (visitChildren) {
            this.useIndent(() => {
                visitChildren()
            })
        }

        if (!isSelfClosing) {
            this.writeLineVisitor(() => {
                this.writeTextHtmlTagEnd(tag)
            })
        }
    }

    writeLineHtmlTagInSameLine(tag: string, node: RstNode | null, visitChildren: VisitChildren) {
        this.writeLineHtmlTagWithAttrInSameLine(tag, node, new HtmlAttributeStore(), visitChildren)
    }

    writeLineHtmlTagWithAttrInSameLine(tag: string, node: RstNode | null, attrs: HtmlAttributeStore, visitChildren: VisitChildren) {
        const isSelfClosing = visitChildren === undefined

        this.writeLineVisitor(() => {
            this.writeTextHtmlTagStart(tag, node, attrs, isSelfClosing)

            visitChildren?.()

            if (!isSelfClosing) {
                this.writeTextHtmlTagEnd(tag)
            }
        })
    }

    private writeTextHtmlTagStart(tag: string, node: RstNode | null, attrs: HtmlAttributeStore, isSelfClosing: boolean) {
        this.writeText('<')
        this.writeText(tag)

        if (node) {
            const htmlId = this.htmlAttrResolver.getNodeHtmlId(node)
            if (htmlId) {
                attrs.set('id', htmlId)
            }

            const htmlClassDirectives = this.htmlAttrResolver.getNodeHtmlClasses(node)
            if (htmlClassDirectives.length > 0) {
                attrs.appendAll('class', htmlClassDirectives)
            }
        }

        this.writeText(attrs.toString())

        if (isSelfClosing) {
            this.writeText(' />')
        } else {
            this.writeText('>')
        }
    }

    private writeTextHtmlTagEnd(tag: string) {
        this.writeText(`</${tag}>`)
    }

    writeLineHtmlComment(text?: string) {
        if (!text) {
            return
        }

        const lines = text.split('\n')

        if (lines.length === 1) {
            if (this.isUsingNoCommentMarkup) {
                this.writeLine(lines[0])
            } else {
                this.writeLine(`<!-- ${lines[0]} -->`)
            }
        } else {
            if (!this.isUsingNoCommentMarkup) {
                this.writeLine('<!--')
            }

            this.useIndent(() => {
                for (const line of lines) {
                    this.writeLine(line)
                }
            })

            if (!this.isUsingNoCommentMarkup) {
                this.writeLine('-->')
            }
        }
    }

    writeLineMdComment(text?: string): void {
        if (!text) {
            return
        }

        if (this.isUsingForcedHtmlMode) {
            this.writeLineHtmlComment(text)
            return
        }

        const lines = text.split('\n')

        for (const line of lines) {
            if (!line) {
                continue
            }

            if (this.isUsingNoCommentMarkup) {
                this.writeLine(line)
            } else {
                this.writeLine(`[${line}]: #`)
            }
        }
    }
}
