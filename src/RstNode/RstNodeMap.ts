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
import type { RstNodeType } from './RstNodeType.js'

export type RstNodeMap = {
    [RstNodeType.Document]: RstDocument

    // ------------------------------------------------------------------------
    // Block elements
    // ------------------------------------------------------------------------

    [RstNodeType.Section]: RstSection
    [RstNodeType.Transition]: RstTransition
    [RstNodeType.Paragraph]: RstParagraph

    [RstNodeType.BulletList]: RstBulletList
    [RstNodeType.BulletListItem]: RstBulletListItem
    [RstNodeType.EnumeratedList]: RstEnumeratedList
    [RstNodeType.DefinitionList]: RstDefinitionList
    [RstNodeType.DefinitionListItem]: RstDefinitionListItem
    [RstNodeType.FieldList]: RstFieldList
    [RstNodeType.FieldListItem]: RstFieldListItem
    [RstNodeType.OptionList]: RstOptionList
    [RstNodeType.OptionListItem]: RstOptionListItem

    [RstNodeType.LiteralBlock]: RstLiteralBlock
    [RstNodeType.LineBlock]: RstLineBlock
    [RstNodeType.LineBlockLine]: RstLineBlockLine
    [RstNodeType.Blockquote]: RstBlockquote
    [RstNodeType.BlockquoteAttribution]: RstBlockquoteAttribution
    [RstNodeType.DoctestBlock]: RstDoctestBlock

    [RstNodeType.Table]: RstTable
    [RstNodeType.TableRow]: RstTableRow
    [RstNodeType.TableCell]: RstTableCell

    [RstNodeType.FootnoteDefGroup]: RstFootnoteDefGroup
    [RstNodeType.FootnoteDef]: RstFootnoteDef
    [RstNodeType.CitationDefGroup]: RstCitationDefGroup
    [RstNodeType.CitationDef]: RstCitationDef
    [RstNodeType.HyperlinkTarget]: RstHyperlinkTarget
    [RstNodeType.Directive]: RstDirective
    [RstNodeType.SubstitutionDef]: RstSubstitutionDef
    [RstNodeType.Comment]: RstComment

    // ------------------------------------------------------------------------
    // Inline elements
    // ------------------------------------------------------------------------

    [RstNodeType.Text]: RstText

    [RstNodeType.StrongEmphasis]: RstStrongEmphasis
    [RstNodeType.Emphasis]: RstEmphasis
    [RstNodeType.InterpretedText]: RstInterpretedText
    [RstNodeType.InlineLiteral]: RstInlineLiteral
    [RstNodeType.SubstitutionRef]: RstSubstitutionRef
    [RstNodeType.InlineInternalTarget]: RstInlineInternalTarget
    [RstNodeType.FootnoteRef]: RstFootnoteRef
    [RstNodeType.CitationRef]: RstCitationRef
    [RstNodeType.HyperlinkRef]: RstHyperlinkRef
}
