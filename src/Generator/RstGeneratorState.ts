import { SimpleName } from '../SimpleName.js'
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
import { FilePathWithoutRst, getFilePathWithoutRst, joinFilePath, normalizeFilePath, resolveFilePath } from './FilePath.js'
import { RstSection } from '@/RstNode/Block/Section.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { HtmlAttributeStore } from './HtmlAttributeStore.js'
import { RstGeneratorError } from './RstGeneratorError.js'
import { sha1 } from '@/utils/sha1.js'
import { SimpleNameResolver } from '@/Parser/Resolver/SimpleNameResolver.js'
import { RstFootnoteDef } from '@/RstNode/ExplicitMarkup/FootnoteDef.js'
import { RstFootnoteRef } from '@/RstNode/Inline/FootnoteRef.js'
import { RstParserOutput } from '@/Parser/RstParserState.js'

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

type ErrorableResolvers =
    'resolveNodeToUrl' |
    'resolveSimpleNameToUrl' |
    'resolveFootnoteDefLabel' |
    'resolveFootnoteRefLabel' |
    'resolveFootnoteRefToDef'

type SimpleNameResolverProxy = {
    [K in ErrorableResolvers]: (
        ...args: Parameters<SimpleNameResolver[K]>[0] extends RstNode
            ? Parameters<SimpleNameResolver[K]>
            : [RstNode, ...Parameters<SimpleNameResolver[K]>]
    ) => Exclude<ReturnType<SimpleNameResolver[K]>, null>
}

export class RstGeneratorState implements SimpleNameResolverProxy {
    private _globalHeaderBuffer = new Map<string, string>() // Content to write to top of output e.g. <script> <link> (indexed by string key so multiple nodes don't output the same content)
    private _downloads = new Map<string, string>() // Maps source of download file (relative to basePath) to expected location to be served
    private _outputBuffers: Array<OutputBuffer> = [
        {
            textOutput: '',
            prefixes: [],
        },
    ]

    private readonly _basePath: FilePathWithoutRst
    private readonly _currentDocPath: FilePathWithoutRst
    private readonly _currentParserOutput: RstParserOutput
    private readonly _docsCache: ReadonlyMap<FilePathWithoutRst, RstParserOutput>
    private readonly _simpleNameCache: ReadonlyMap<SimpleName, FilePathWithoutRst>

    private _enableUnicodeConversion = false
    private _enableForcedHtmlMode = false // Some constructs cannot be represented in Markdown so we switch to outputting html recursively as fallback
    private _disableLineBreaksBetweenBlocks = false
    private _disableCommentMarkup = false // So we don't write comment markup inside a parent comment

    constructor(
        readonly opts: RstGeneratorOptions,
        private readonly _generatorInput: Readonly<RstGeneratorInput>,
        private readonly _compiler: RstCompiler,
    ) {
        if (!_generatorInput.basePath.startsWith('/') || !_generatorInput.basePath.endsWith('/')) {
            throw new Error(`basePath:"${_generatorInput.basePath}" must start and end with "/"`)
        }

        const currentDoc = _generatorInput.docs.find(({ docPath }) => docPath === _generatorInput.currentDocPath)
        if (!currentDoc) {
            throw new Error(`Failed to find "${_generatorInput.currentDocPath}" in generatorInput.docs`)
        }

        this._basePath = getFilePathWithoutRst(normalizeFilePath(_generatorInput.basePath))
        this._currentDocPath = getFilePathWithoutRst(joinFilePath(this._basePath, currentDoc.docPath))
        this._currentParserOutput = currentDoc.parserOutput

        this._docsCache = new Map(_generatorInput.docs.map(({ docPath, parserOutput }) => {
            const absPath = getFilePathWithoutRst(joinFilePath(this._basePath, docPath))
            return [absPath, parserOutput]
        }))
        this._simpleNameCache = new Map(_generatorInput.docs.flatMap(({ docPath, parserOutput }) => {
            const names = parserOutput.simpleNameResolver.simpleNamesTargetableFromOutside
            const absPath = getFilePathWithoutRst(joinFilePath(this._basePath, docPath))
            return names.map((name) => [name, absPath])
        }))

        this.visitNode(this._currentParserOutput.root)
    }

    registerGlobalHeader(key: string, text: string) {
        this._globalHeaderBuffer.set(key, text)
    }

    registerDownload(targetPath: string) {
        const downloadSrc = targetPath.startsWith('/')
            ? joinFilePath(this._basePath, targetPath) // If given abs path, assume we want to search from basePath
            : resolveFilePath(this._currentDocPath, targetPath) // Otherwise, assume we want to search relative from current doc

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
    // MARK: Getters
    // ------------------------------------------------------------------------

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

    get simpleNameResolver(): Omit<SimpleNameResolver, ErrorableResolvers> {
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
            : resolveFilePath(this._currentDocPath, targetPath) // Otherwise, assume we want to search relative from current doc

        const docPath = getFilePathWithoutRst(docFilePath)
        const externalUrl = `${docPath}.html`

        const parserOutput = this._docsCache.get(docPath)
        if (!parserOutput) {
            throw new RstGeneratorError(this, srcNode, `targetPath:"${docPath}" (resolved from "${targetPath}") not found`)
        }

        const firstSection = parserOutput.root.findFirstChild(RstNodeType.Section)
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

        const targetNode = parserOutput.simpleNameResolver.resolveSimpleNameFromOutside(targetRef)
        if (!targetNode) {
            throw new RstGeneratorError(this, srcNode, `Failed to resolveExternalRef "${targetRef}"`)
        }

        // Usually targetSimpleName refers to the HyperlinkTarget
        // and externalSimpleName refers to the Section that it is pointing at
        const externalSimpleName = parserOutput.simpleNameResolver.getSimpleName(targetNode)
        const externalUrl = docPath === this._currentDocPath
            ? `#${externalSimpleName}`
            : `${docPath}#${externalSimpleName}`

        const externalLabel = (targetNode instanceof RstSection)
            ? targetNode.textContent
            : undefined

        return {
            externalUrl,
            externalLabel,
        }
    }

    resolveNodeToUrl(node: RstNode): string {
        const url = this._currentParserOutput.simpleNameResolver.resolveNodeToUrl(node)
        if (!url) {
            throw new RstGeneratorError(this, node, 'Failed to resolveNodeToUrl')
        }

        return url
    }

    resolveSimpleNameToUrl(srcNode: RstNode, simpleName: SimpleName): string {
        const url = this._currentParserOutput.simpleNameResolver.resolveSimpleNameToUrl(simpleName)
        if (!url) {
            throw new RstGeneratorError(this, srcNode, 'Failed to resolveSimpleNameToUrl')
        }

        return url
    }

    resolveMultipleSimpleNamesToUrl(srcNode: RstNode, simpleNames: Array<SimpleName>): string {
        for (const simpleName of simpleNames) {
            const url = this._currentParserOutput.simpleNameResolver.resolveSimpleNameToUrl(simpleName)
            if (url) {
                return url
            }
        }

        throw new RstGeneratorError(this, srcNode, 'Failed to resolveMultipleSimpleNamesToUrl')
    }

    resolveFootnoteDefLabel(footnoteDef: RstFootnoteDef): string {
        const label = this._currentParserOutput.simpleNameResolver.resolveFootnoteDefLabel(footnoteDef)
        if (!label) {
            throw new RstGeneratorError(this, footnoteDef, 'Failed to resolveFootnoteDefLabel')
        }

        return label
    }

    resolveFootnoteRefLabel(footnoteRef: RstFootnoteRef): string {
        const label = this._currentParserOutput.simpleNameResolver.resolveFootnoteRefLabel(footnoteRef)
        if (!label) {
            throw new RstGeneratorError(this, footnoteRef, 'Failed to resolveFootnoteRefLabel')
        }

        return label
    }

    resolveFootnoteRefToDef(footnoteRef: RstFootnoteRef): RstFootnoteDef {
        const footnoteDef =  this._currentParserOutput.simpleNameResolver.resolveFootnoteRefToDef(footnoteRef)
        if (!footnoteDef) {
            throw new RstGeneratorError(this, footnoteRef, 'Failed to resolveFootnoteRefToDef')
        }

        return footnoteDef
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
                    const generator = this._compiler.interpretedTextGenerators.get(node.role)
                    if (!generator) {
                        throw new RstGeneratorError(this, node, 'Missing generator')
                    }

                    generator.generate(this, node)
                    break
                }

                case node instanceof RstDirective: {
                    const generator = this._compiler.directiveGenerators.get(node.directive)
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
                    (generator as RstNodeGenerator<RstNodeType.Document>).generate(this, node as RstDocument)
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
            if (this.htmlAttrResolver.hasForcedHtmlId(node)) {
                const simpleName = this._currentParserOutput.simpleNameResolver.getSimpleName(node)
                attrs.set('id', simpleName)
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
