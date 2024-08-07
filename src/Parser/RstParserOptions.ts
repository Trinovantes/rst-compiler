import merge from 'lodash.merge'

export type RstParserOptions = {
    disableWarnings: boolean
    disableErrors: boolean

    /**
     * Treat first FieldList of Document as meta options for the document rather than content
     *
     * Default: `true`
     */
    parseFirstFieldListAsDocumentMeta: boolean

    /**
     * Number of spaces of input reStructuredText document use for indentation
     *
     * Used to denote the start of:
     * * Blockquote
     * * LineBlock
     * * DefinitionList
     *
     * Default: `4`
     */
    inputIndentSize: number

    /**
     * Specify default role for InterpretedText when not provided
     *
     * Default: `'title-reference'`
     */
    defaultInterpretedTextRole: string

    /**
     * Relaxes inline parsing to allow whitespace and special characters immediately before inline markup and immediately after inline markup
     *
     * See https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#character-level-inline-markup
     *
     * Default: `false`
     */
    enableCharacterLevelInlineMarkup: boolean

    /**
     * Directives whose bodies should be consumed as raw text instead of parsing them as nested blocks
     */
    directivesWithRawText: Array<string>

    /**
     * Directives whose firstLineText should not be part of its children (i.e. it's specially parsed as separate text for other purposes)
     */
    directivesWithInitContent: Array<string>

    /**
     * Directives that will not render anything visible (i.e. control directives like "rst-class")
     */
    directivesWithInvisibleContent: Array<string>

    /**
     * String that will be included at the end of every source file
     *
     * This is a possible place to add substitutions that should be available in every file
     *
     * Default: `''`
     */
    epilog: string
}

export function createDefaultParserOptions(opts?: Partial<RstParserOptions>): RstParserOptions {
    const defaultOpts: RstParserOptions = {
        disableWarnings: false,
        disableErrors: false,

        parseFirstFieldListAsDocumentMeta: true,
        inputIndentSize: opts?.inputIndentSize ?? 4,
        defaultInterpretedTextRole: opts?.defaultInterpretedTextRole ?? 'title-reference',
        enableCharacterLevelInlineMarkup: opts?.enableCharacterLevelInlineMarkup ?? false,
        directivesWithRawText: [],
        directivesWithInitContent: [],
        directivesWithInvisibleContent: [],

        epilog: '',
    }

    return merge(defaultOpts, opts)
}
