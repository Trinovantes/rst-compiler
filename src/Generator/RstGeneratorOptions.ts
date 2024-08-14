import merge from 'lodash.merge'
import { KatexOptions } from 'katex'
import { createHighlighter, ShikiTransformer, CodeOptionsMultipleThemes } from 'shiki'

export type RstGeneratorOptions = {
    disableWarnings: boolean
    disableErrors: boolean

    /**
     * Number of spaces for output indentation
     *
     * Default: `4`
     */
    outputIndentSize: number

    /**
     * Prints m-dash before BlockquoteAttribution
     *
     * Default: `true`
     */
    enableBlockQuoteAttributionDash: boolean

    /**
     * Specify default format for SubstitutionDef with "date" directive
     *
     * This value is passed to `date-fns format()`
     *
     * See https://date-fns.org/v3.6.0/docs/format
     *
     * Default: `'y-MM-dd'`
     */
    substitutionDateFormat: string

    /**
     * Html class generated for nodes
     */
    htmlClass: Partial<{
        lineBlock: string
        lineBlockLine: string
        definitionListItemClassifier: string
        fieldList: string
        optionList: string
        optionListItemOption: string

        citationRef: string
        citationDef: string
        citationDefGroup: string
        citationDefBacklinks: string

        footnoteRef: string
        footnoteDef: string
        footnoteDefGroup: string
        footnoteDefBacklinks: string

        inlineInternalTarget: string

        literalBlock: string
        literalInline: string
        codeBlock: string
        codeInline: string
        docTestBlock: string

        directiveAdmonition: string
        directiveCentered: string
        directiveContainer: string

        mathBlock: string
        mathInline: string

        tocTree: string
    }>

    /**
     * Values for resolving `only` directive's expression
     */
    outputEnv?: Record<string, boolean>

    /**
     * ### HTML ONLY
     *
     * Options for rendering math equations with katex
     */
    katex?: {
        opts: KatexOptions
    }

    /**
     * Default language for syntax highlighting LiteralBlock
     *
     * Default: `'txt'`
     */
    defaultLiteralBlockLanguage: string

    /**
     * Default language for syntax highlighting in `code` and `code-block` Directives
     *
     * Default: `'txt'`
     */
    defaultCodeDirectiveLanguage: string

    /**
     * ### HTML ONLY
     *
     * Options for syntax highlighting `code` and `code-block` Directives with shiki
     *
     * If not set, `code` and `code-block` Directives will output code inside plain `<pre>`
     */
    shiki?: {
        highlighter: Awaited<ReturnType<typeof createHighlighter>>
        theme: string | CodeOptionsMultipleThemes['themes']
        transformers?: Array<ShikiTransformer>
    }

    /**
     * Directives that will output markdown containers as defined by `markdown-it-container`
     *
     *      ::: warning
     *      Hello World
     *      :::
     */
    directivesWillOutputMdContainers: Array<string>
}

export function createDefaultGeneratorOptions(opts?: Partial<RstGeneratorOptions>): RstGeneratorOptions {
    const defaultOpts: RstGeneratorOptions = {
        disableWarnings: false,
        disableErrors: false,

        outputIndentSize: 4,
        enableBlockQuoteAttributionDash: true,
        substitutionDateFormat: 'y-MM-dd',
        htmlClass: {
            lineBlock: 'line-block',
            lineBlockLine: 'line',
            definitionListItemClassifier: 'classifier',
            fieldList: 'docinfo',
            optionList: 'option-list',
            optionListItemOption: 'option',

            citationRef: 'citation-reference',
            citationDef: 'citation-definition',
            citationDefGroup: 'citations',
            citationDefBacklinks: 'backlinks',

            footnoteRef: 'footnote-reference',
            footnoteDef: 'footnote-definition',
            footnoteDefGroup: 'footnotes',
            footnoteDefBacklinks: 'backlinks',

            inlineInternalTarget: 'target',

            literalBlock: 'literal-block',
            literalInline: 'literal',
            codeBlock: 'code',
            codeInline: 'code',
            docTestBlock: 'doctest',

            directiveAdmonition: 'admonition',
            directiveCentered: 'centered',
            directiveContainer: 'container',

            mathBlock: 'formula',
            mathInline: 'formula',

            tocTree: 'toc-tree',
        } satisfies Required<RstGeneratorOptions['htmlClass']>,

        defaultLiteralBlockLanguage: 'txt',
        defaultCodeDirectiveLanguage: 'txt',

        directivesWillOutputMdContainers: [],
    }

    return merge(defaultOpts, opts)
}
