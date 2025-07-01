export type RstNodeType =
    | 'Document'

    // ------------------------------------------------------------------------
    // Block elements
    // ------------------------------------------------------------------------

    | 'Section' // <h1> to <h6>
    | 'Transition' // <hr>
    | 'Paragraph' // Generic fallback

    | 'BulletList' // <ul>
    | 'BulletListItem' // <li>
    | 'EnumeratedList' // <ol>
    | 'DefinitionList' // <dl>
    | 'DefinitionListItem' // <dt> and <dd>
    | 'FieldList'
    | 'FieldListItem'
    | 'OptionList'
    | 'OptionListItem'

    | 'LiteralBlock'
    | 'LineBlock'
    | 'LineBlockLine'
    | 'Blockquote'
    | 'BlockquoteAttribution'
    | 'DoctestBlock'

    | 'Table'
    | 'TableRow'
    | 'TableCell'

    | 'FootnoteDefGroup'
    | 'FootnoteDef'
    | 'CitationDefGroup'
    | 'CitationDef'
    | 'HyperlinkTarget'
    | 'Directive'
    | 'SubstitutionDef'
    | 'Comment'

    // ------------------------------------------------------------------------
    // Inline elements
    // ------------------------------------------------------------------------

    | 'Text' // Plaintext

    | 'StrongEmphasis' // <strong>
    | 'Emphasis' // <em>
    | 'InterpretedText' // Depends on :role:`text`
    | 'InlineLiteral' // <span>
    | 'SubstitutionRef' // <a> linking to SubstitutionDef
    | 'InlineInternalTarget' // Inline equivalent of HyperlinkTarget
    | 'FootnoteRef' // <a> linking to FootnoteDef
    | 'CitationRef' // <a> linking to CitationDef
    | 'HyperlinkRef' // <a> linking to exteral url | HyperlinkTarget | or InlineInternalTarget
