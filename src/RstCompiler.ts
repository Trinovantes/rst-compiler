import { tokenizeInput } from './Lexer/tokenizeInput.js'
import { RstParserOutput, RstParserState } from './Parser/RstParserState.js'
import { RstDirectiveGenerator, RstInterpretedTextGenerator, RstNodeGenerator } from './Generator/RstGenerator.js'
import { RstGeneratorInput, RstGeneratorOutput, RstGeneratorState } from './Generator/RstGeneratorState.js'
import { RstGeneratorOptions, createDefaultGeneratorOptions } from './Generator/RstGeneratorOptions.js'
import { RstParserOptions, createDefaultParserOptions } from './Parser/RstParserOptions.js'
import { htmlNodeGenerators, htmlPlugins, mdNodeGenerators, mdPlugins, nodeParsers } from './Defaults.js'
import { RstNodeType } from './RstNode/RstNodeType.js'
import { RstNodeParser } from './Parser/RstParser.js'
import { RstCompilerPlugin } from './RstCompilerPlugin.js'
import { RstNodeJson } from './RstNode/RstNode.js'
import { RstNodeRegistrar } from './Parser/RstNodeRegistrar.js'
import { RstDocument } from './RstNode/Block/Document.js'
import { HtmlAttrResolver } from './Parser/Resolver/HtmlAttrResolver.js'
import { SimpleNameResolver } from './Parser/Resolver/SimpleNameResolver.js'
import { SubstitutionResolver } from './Parser/Resolver/SubstitutionResolver.js'

// ----------------------------------------------------------------------------
// MARK: Base
// ----------------------------------------------------------------------------

export class RstCompiler {
    readonly nodeParsers = [...nodeParsers]
    readonly nodeGenerators = new Map<RstNodeType, RstNodeGenerator>()
    readonly directiveGenerators = new Map<string, RstDirectiveGenerator>()
    readonly interpretedTextGenerators = new Map<string, RstInterpretedTextGenerator>()
    readonly plugins = new Array<RstCompilerPlugin>()

    private readonly _outputWarnings = new Array<string>()
    private readonly _outputErrors = new Array<string>()

    useNodeParser(parser: RstNodeParser) {
        this.nodeParsers.unshift(parser)
    }

    useNodeGenerator(generator: RstNodeGenerator) {
        this.nodeGenerators.set(generator.nodeType, generator)
    }

    useDirectiveGenerator(generator: RstDirectiveGenerator) {
        for (const directive of generator.directives) {
            this.directiveGenerators.set(directive, generator)
        }
    }

    useInterpretedTextGenerator(generator: RstInterpretedTextGenerator) {
        for (const role of generator.roles) {
            this.interpretedTextGenerators.set(role, generator)
        }
    }

    usePlugin(plugin: RstCompilerPlugin) {
        this.plugins.push(plugin)
        plugin.onInstall?.(this)
    }

    notifyWarning(text: string) {
        this._outputWarnings.push(text)
    }

    notifyError(text: string) {
        this._outputErrors.push(text)
    }

    clearNotifications() {
        this._outputWarnings.length = 0
        this._outputErrors.length = 0
    }

    get outputWarnings(): ReadonlyArray<string> {
        return this._outputWarnings
    }

    get outputErrors(): ReadonlyArray<string> {
        return this._outputErrors
    }

    consoleLogProblems(opts?: { disableWarnings?: boolean; disableErrors?: boolean }): void {
        if (!opts?.disableWarnings) {
            for (const warning of this.outputWarnings) {
                console.warn(warning)
            }
        }

        if (!opts?.disableErrors) {
            for (const error of this.outputErrors) {
                console.error(error)
            }
        }
    }

    parse(input: string, parserOptions?: Partial<RstParserOptions>): RstParserOutput {
        this.clearNotifications()

        const opts = createDefaultParserOptions(parserOptions)
        for (const plugin of this.plugins) {
            plugin.onBeforeParse?.(opts)
        }

        if (opts.epilog) {
            input += `\n\n${opts.epilog}`
        }

        const tokens = tokenizeInput(input)
        const parserState = new RstParserState(opts, tokens, this)
        const parserOutput = parserState.parserOutput

        for (const plugin of this.plugins) {
            plugin.onParse?.(parserOutput)
        }

        this.consoleLogProblems(opts)
        return parserOutput
    }

    parseJson(rootJson: RstNodeJson, parserOptions?: Partial<RstParserOptions>): RstParserOutput {
        this.clearNotifications()

        const opts = createDefaultParserOptions(parserOptions)
        for (const plugin of this.plugins) {
            plugin.onBeforeParse?.(opts)
        }

        const registrar = new RstNodeRegistrar()
        const root = registrar.reviveRstNodeFromJson(rootJson)
        if (!(root instanceof RstDocument)) {
            throw new Error('Failed to parseJson')
        }

        const parserOutput = this.createParserOutput(root)
        for (const plugin of this.plugins) {
            plugin.onParse?.(parserOutput)
        }

        this.consoleLogProblems(opts)
        return parserOutput
    }

    generate(generatorInput: RstGeneratorInput, generatorOptions?: Partial<RstGeneratorOptions>): RstGeneratorOutput {
        this.clearNotifications()

        const opts = createDefaultGeneratorOptions(generatorOptions)
        for (const plugin of this.plugins) {
            plugin.onBeforeGenerate?.(opts)
        }

        const generatorState = new RstGeneratorState(opts, generatorInput, this)
        const generatorOutput = generatorState.generatorOutput

        for (const plugin of this.plugins) {
            plugin.onGenerate?.(generatorOutput)
        }

        this.consoleLogProblems(generatorOptions)
        return generatorOutput
    }

    createParserOutput(root: RstDocument) {
        const htmlAttrResolver = new HtmlAttrResolver()
        const substitutionResolver = new SubstitutionResolver(root.findAllChildren(RstNodeType.SubstitutionDef))
        const simpleNameResolver = new SimpleNameResolver(this, htmlAttrResolver, root)

        return {
            root,
            htmlAttrResolver,
            substitutionResolver,
            simpleNameResolver,
        }
    }

    compile(input: string | RstParserOutput, parserOptions?: Partial<RstParserOptions>, generatorOptions?: Partial<RstGeneratorOptions>): RstGeneratorOutput {
        const parserOutput = typeof input === 'string'
            ? this.parse(input, parserOptions)
            : input

        const basePath = '/'
        const docPath = 'index'
        const generatorInput: RstGeneratorInput = {
            basePath,
            currentDocPath: docPath,
            docs: [
                {
                    docPath,
                    parserOutput,
                },
            ],
        }

        return this.generate(generatorInput, generatorOptions)
    }
}

// ----------------------------------------------------------------------------
// MARK: Html
// ----------------------------------------------------------------------------

export class RstToHtmlCompiler extends RstCompiler {
    constructor() {
        super()

        for (const generator of htmlNodeGenerators) {
            this.useNodeGenerator(generator)
        }

        for (const plugin of htmlPlugins) {
            this.usePlugin(plugin)
        }
    }
}

// ----------------------------------------------------------------------------
// MARK: Markdown
// ----------------------------------------------------------------------------

export class RstToMdCompiler extends RstCompiler {
    constructor() {
        super()

        for (const generator of mdNodeGenerators) {
            this.useNodeGenerator(generator)
        }

        for (const plugin of mdPlugins) {
            this.usePlugin(plugin)
        }
    }
}
