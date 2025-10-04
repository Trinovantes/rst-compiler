import type { RstBlockquote } from './Block/Blockquote.ts'
import type { RstBlockquoteAttribution } from './Block/BlockquoteAttribution.ts'
import type { RstDoctestBlock } from './Block/DoctestBlock.ts'
import type { RstDocument } from './Block/Document.ts'
import type { RstLineBlock, RstLineBlockLine } from './Block/LineBlock.ts'
import type { RstLiteralBlock } from './Block/LiteralBlock.ts'
import type { RstParagraph } from './Block/Paragraph.ts'
import type { RstSection } from './Block/Section.ts'
import type { RstTransition } from './Block/Transition.ts'
import type { RstCitationDef } from './ExplicitMarkup/CitationDef.ts'
import type { RstCitationDefGroup } from './ExplicitMarkup/CitationDefGroup.ts'
import type { RstComment } from './ExplicitMarkup/Comment.ts'
import type { RstDirective } from './ExplicitMarkup/Directive.ts'
import type { RstFootnoteDef } from './ExplicitMarkup/FootnoteDef.ts'
import type { RstFootnoteDefGroup } from './ExplicitMarkup/FootnoteDefGroup.ts'
import type { RstHyperlinkTarget } from './ExplicitMarkup/HyperlinkTarget.ts'
import type { RstSubstitutionDef } from './ExplicitMarkup/SubstitutionDef.ts'
import type { RstCitationRef } from './Inline/CitationRef.ts'
import type { RstEmphasis } from './Inline/Emphasis.ts'
import type { RstFootnoteRef } from './Inline/FootnoteRef.ts'
import type { RstHyperlinkRef } from './Inline/HyperlinkRef.ts'
import type { RstInlineInternalTarget } from './Inline/InlineInternalTarget.ts'
import type { RstInlineLiteral } from './Inline/InlineLiteral.ts'
import type { RstInterpretedText } from './Inline/InterpretedText.ts'
import type { RstStrongEmphasis } from './Inline/StrongEmphasis.ts'
import type { RstSubstitutionRef } from './Inline/SubstitutionRef.ts'
import type { RstText } from './Inline/Text.ts'
import type { RstBulletList } from './List/BulletList.ts'
import type { RstBulletListItem } from './List/BulletListItem.ts'
import type { RstDefinitionList } from './List/DefinitionList.ts'
import type { RstDefinitionListItem } from './List/DefinitionListItem.ts'
import type { RstEnumeratedList } from './List/EnumeratedList.ts'
import type { RstFieldList } from './List/FieldList.ts'
import type { RstFieldListItem } from './List/FieldListItem.ts'
import type { RstOptionList } from './List/OptionList.ts'
import type { RstOptionListItem } from './List/OptionListItem.ts'
import type { RstTable } from './Table/Table.ts'
import type { RstTableCell } from './Table/TableCell.ts'
import type { RstTableRow } from './Table/TableRow.ts'

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
