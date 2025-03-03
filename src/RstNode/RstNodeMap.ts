import type { RstBlockquote } from './Block/Blockquote.js'
import type { RstBlockquoteAttribution } from './Block/BlockquoteAttribution.js'
import type { RstDoctestBlock } from './Block/DoctestBlock.js'
import type { RstDocument } from './Block/Document.js'
import type { RstLineBlock, RstLineBlockLine } from './Block/LineBlock.js'
import type { RstLiteralBlock } from './Block/LiteralBlock.js'
import type { RstParagraph } from './Block/Paragraph.js'
import type { RstSection } from './Block/Section.js'
import type { RstTransition } from './Block/Transition.js'
import type { RstCitationDef } from './ExplicitMarkup/CitationDef.js'
import type { RstCitationDefGroup } from './ExplicitMarkup/CitationDefGroup.js'
import type { RstComment } from './ExplicitMarkup/Comment.js'
import type { RstDirective } from './ExplicitMarkup/Directive.js'
import type { RstFootnoteDef } from './ExplicitMarkup/FootnoteDef.js'
import type { RstFootnoteDefGroup } from './ExplicitMarkup/FootnoteDefGroup.js'
import type { RstHyperlinkTarget } from './ExplicitMarkup/HyperlinkTarget.js'
import type { RstSubstitutionDef } from './ExplicitMarkup/SubstitutionDef.js'
import type { RstCitationRef } from './Inline/CitationRef.js'
import type { RstEmphasis } from './Inline/Emphasis.js'
import type { RstFootnoteRef } from './Inline/FootnoteRef.js'
import type { RstHyperlinkRef } from './Inline/HyperlinkRef.js'
import type { RstInlineInternalTarget } from './Inline/InlineInternalTarget.js'
import type { RstInlineLiteral } from './Inline/InlineLiteral.js'
import type { RstInterpretedText } from './Inline/InterpretedText.js'
import type { RstStrongEmphasis } from './Inline/StrongEmphasis.js'
import type { RstSubstitutionRef } from './Inline/SubstitutionRef.js'
import type { RstText } from './Inline/Text.js'
import type { RstBulletList } from './List/BulletList.js'
import type { RstBulletListItem } from './List/BulletListItem.js'
import type { RstDefinitionList } from './List/DefinitionList.js'
import type { RstDefinitionListItem } from './List/DefinitionListItem.js'
import type { RstEnumeratedList } from './List/EnumeratedList.js'
import type { RstFieldList } from './List/FieldList.js'
import type { RstFieldListItem } from './List/FieldListItem.js'
import type { RstOptionList } from './List/OptionList.js'
import type { RstOptionListItem } from './List/OptionListItem.js'
import type { RstTable } from './Table/Table.js'
import type { RstTableCell } from './Table/TableCell.js'
import type { RstTableRow } from './Table/TableRow.js'

export type RstNodeMap = {
    ['Document']: RstDocument

    // ------------------------------------------------------------------------
    // Block elements
    // ------------------------------------------------------------------------

    ['Section']: RstSection
    ['Transition']: RstTransition
    ['Paragraph']: RstParagraph

    ['BulletList']: RstBulletList
    ['BulletListItem']: RstBulletListItem
    ['EnumeratedList']: RstEnumeratedList
    ['DefinitionList']: RstDefinitionList
    ['DefinitionListItem']: RstDefinitionListItem
    ['FieldList']: RstFieldList
    ['FieldListItem']: RstFieldListItem
    ['OptionList']: RstOptionList
    ['OptionListItem']: RstOptionListItem

    ['LiteralBlock']: RstLiteralBlock
    ['LineBlock']: RstLineBlock
    ['LineBlockLine']: RstLineBlockLine
    ['Blockquote']: RstBlockquote
    ['BlockquoteAttribution']: RstBlockquoteAttribution
    ['DoctestBlock']: RstDoctestBlock

    ['Table']: RstTable
    ['TableRow']: RstTableRow
    ['TableCell']: RstTableCell

    ['FootnoteDefGroup']: RstFootnoteDefGroup
    ['FootnoteDef']: RstFootnoteDef
    ['CitationDefGroup']: RstCitationDefGroup
    ['CitationDef']: RstCitationDef
    ['HyperlinkTarget']: RstHyperlinkTarget
    ['Directive']: RstDirective
    ['SubstitutionDef']: RstSubstitutionDef
    ['Comment']: RstComment

    // ------------------------------------------------------------------------
    // Inline elements
    // ------------------------------------------------------------------------

    ['Text']: RstText

    ['StrongEmphasis']: RstStrongEmphasis
    ['Emphasis']: RstEmphasis
    ['InterpretedText']: RstInterpretedText
    ['InlineLiteral']: RstInlineLiteral
    ['SubstitutionRef']: RstSubstitutionRef
    ['InlineInternalTarget']: RstInlineInternalTarget
    ['FootnoteRef']: RstFootnoteRef
    ['CitationRef']: RstCitationRef
    ['HyperlinkRef']: RstHyperlinkRef
}
