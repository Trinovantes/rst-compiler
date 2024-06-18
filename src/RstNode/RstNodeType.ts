export const enum RstNodeType {
    Document = 'Document',

    // ------------------------------------------------------------------------
    // Block elements
    // ------------------------------------------------------------------------

    Section = 'Section', // <h1> to <h6>
    Transition = 'Transition', // <hr>
    Paragraph = 'Paragraph', // Generic fallback

    BulletList = 'BulletList', // <ul>
    BulletListItem = 'BulletListItem', // <li>
    EnumeratedList = 'EnumeratedList', // <ol>
    DefinitionList = 'DefinitionList', // <dl>
    DefinitionListItem = 'DefinitionListItem', // <dt> and <dd>
    FieldList = 'FieldList',
    FieldListItem = 'FieldListItem',
    OptionList = 'OptionList',
    OptionListItem = 'OptionListItem',

    LiteralBlock = 'LiteralBlock',
    LineBlock = 'LineBlock',
    LineBlockLine = 'LineBlockLine',
    Blockquote = 'Blockquote',
    BlockquoteAttribution = 'BlockquoteAttribution',
    DoctestBlock = 'DoctestBlock',

    Table = 'Table',
    TableRow = 'TableRow',
    TableCell = 'TableCell',

    FootnoteDefGroup = 'FootnoteDefGroup',
    FootnoteDef = 'FootnoteDef',
    CitationDefGroup = 'CitationDefGroup',
    CitationDef = 'CitationDef',
    HyperlinkTarget = 'HyperlinkTarget',
    Directive = 'Directive',
    SubstitutionDef = 'SubstitutionDef',
    Comment = 'Comment',

    // ------------------------------------------------------------------------
    // Inline elements
    // ------------------------------------------------------------------------

    Text = 'Text', // Plaintext

    StrongEmphasis = 'StrongEmphasis', // <strong>
    Emphasis = 'Emphasis', // <em>
    InterpretedText = 'InterpretedText', // Depends on :role:`text`
    InlineLiteral = 'InlineLiteral', // <span>
    SubstitutionRef = 'SubstitutionRef', // <a> linking to SubstitutionDef
    InlineInternalTarget = 'InlineInternalTarget', // Inline equivalent of HyperlinkTarget
    FootnoteRef = 'FootnoteRef', // <a> linking to FootnoteDef
    CitationRef = 'CitationRef', // <a> linking to CitationDef
    HyperlinkRef = 'HyperlinkRef', // <a> linking to exteral url, HyperlinkTarget, or InlineInternalTarget
}
