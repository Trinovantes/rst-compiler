import { Brand } from '@/@types/Brand.js'
import { RstBlockquote } from '@/RstNode/Block/Blockquote.js'
import { RstBlockquoteAttribution } from '@/RstNode/Block/BlockquoteAttribution.js'
import { RstDoctestBlock, RstDoctestBlockData } from '@/RstNode/Block/DoctestBlock.js'
import { RstDocument, RstDocumentData } from '@/RstNode/Block/Document.js'
import { RstLineBlock, RstLineBlockLine } from '@/RstNode/Block/LineBlock.js'
import { RstLiteralBlock, RstLiteralBlockData } from '@/RstNode/Block/LiteralBlock.js'
import { RstParagraph } from '@/RstNode/Block/Paragraph.js'
import { RstSection, RstSectionData } from '@/RstNode/Block/Section.js'
import { RstTransition } from '@/RstNode/Block/Transition.js'
import { RstCitationDef, RstCitationDefData } from '@/RstNode/ExplicitMarkup/CitationDef.js'
import { RstCitationDefGroup } from '@/RstNode/ExplicitMarkup/CitationDefGroup.js'
import { RstComment, RstCommentData } from '@/RstNode/ExplicitMarkup/Comment.js'
import { RstDirective, RstDirectiveData } from '@/RstNode/ExplicitMarkup/Directive.js'
import { RstFootnoteDef, RstFootnoteDefData } from '@/RstNode/ExplicitMarkup/FootnoteDef.js'
import { RstFootnoteDefGroup } from '@/RstNode/ExplicitMarkup/FootnoteDefGroup.js'
import { RstHyperlinkTarget, RstHyperlinkTargetData } from '@/RstNode/ExplicitMarkup/HyperlinkTarget.js'
import { RstSubstitutionDef, RstSubstitutionDefData } from '@/RstNode/ExplicitMarkup/SubstitutionDef.js'
import { RstCitationRef } from '@/RstNode/Inline/CitationRef.js'
import { RstEmphasis } from '@/RstNode/Inline/Emphasis.js'
import { RstFootnoteRef } from '@/RstNode/Inline/FootnoteRef.js'
import { RstHyperlinkRef, RstHyperlinkRefData } from '@/RstNode/Inline/HyperlinkRef.js'
import { RstInlineInternalTarget } from '@/RstNode/Inline/InlineInternalTarget.js'
import { RstInlineLiteral } from '@/RstNode/Inline/InlineLiteral.js'
import { RstInterpretedText, RstInterpretedTextData } from '@/RstNode/Inline/InterpretedText.js'
import { RstStrongEmphasis } from '@/RstNode/Inline/StrongEmphasis.js'
import { RstSubstitutionRef } from '@/RstNode/Inline/SubstitutionRef.js'
import { RstText, RstTextData } from '@/RstNode/Inline/Text.js'
import { RstBulletList } from '@/RstNode/List/BulletList.js'
import { RstBulletListItem, RstBulletListItemData } from '@/RstNode/List/BulletListItem.js'
import { RstDefinitionList } from '@/RstNode/List/DefinitionList.js'
import { RstDefinitionListItem, RstDefinitionListItemData } from '@/RstNode/List/DefinitionListItem.js'
import { RstEnumeratedList, RstEnumeratedListData } from '@/RstNode/List/EnumeratedList.js'
import { RstFieldList } from '@/RstNode/List/FieldList.js'
import { RstFieldListItem, RstFieldListItemData } from '@/RstNode/List/FieldListItem.js'
import { RstOptionList } from '@/RstNode/List/OptionList.js'
import { OptionListItemData, RstOptionListItem } from '@/RstNode/List/OptionListItem.js'
import { RstNode, RstNodeJson } from '@/RstNode/RstNode.js'
import { RstNodeType } from '@/RstNode/RstNodeType.js'
import { RstTable, RstTableData } from '@/RstNode/Table/Table.js'
import { RstTableCell, RstTableCellData } from '@/RstNode/Table/TableCell.js'
import { RstTableRow, RstTableRowData } from '@/RstNode/Table/TableRow.js'

export type RstNodeId = Brand<number, 'RstNodeId'>
export type RstNodeRegistration = {
    id: RstNodeId // 1-based count
    nthOfType: number // 1-based count
}

export class RstNodeRegistrar {
    // Not quite an exact Arena pattern
    // Since we want to support arbitrary 3rd party node types, we can't implement factory functions inside this class
    // Instead, we let nodes' constructors call this class to register themselves
    private readonly _nodes = new Array<RstNode>()
    private readonly _nodesOfType = new Map<RstNodeType, Array<RstNode>>()

    registerNewNode(node: RstNode): RstNodeRegistration {
        if (!this._nodesOfType.has(node.nodeType)) {
            this._nodesOfType.set(node.nodeType, [])
        }

        this._nodes.push(node)
        this._nodesOfType.get(node.nodeType)?.push(node)

        return {
            id: this._nodes.length as RstNodeId,
            nthOfType: this._nodesOfType.get(node.nodeType)?.length ?? 0xDEADBEEF,
        }
    }

    reviveRstNodeFromJson(json: RstNodeJson): RstNode {
        switch (json.type) {
            case RstNodeType.Document: return RstDocument.reviveRstNodeFromJson(this, json as RstNodeJson<RstDocumentData>)

            case RstNodeType.Section: return RstSection.reviveRstNodeFromJson(this, json as RstNodeJson<RstSectionData>)
            case RstNodeType.Transition: return RstTransition.reviveRstNodeFromJson(this, json)
            case RstNodeType.Paragraph: return RstParagraph.reviveRstNodeFromJson(this, json)

            case RstNodeType.BulletList: return RstBulletList.reviveRstNodeFromJson(this, json)
            case RstNodeType.BulletListItem: return RstBulletListItem.reviveRstNodeFromJson(this, json as RstNodeJson<RstBulletListItemData>)
            case RstNodeType.EnumeratedList: return RstEnumeratedList.reviveRstNodeFromJson(this, json as RstNodeJson<RstEnumeratedListData>)
            case RstNodeType.DefinitionList: return RstDefinitionList.reviveRstNodeFromJson(this, json)
            case RstNodeType.DefinitionListItem: return RstDefinitionListItem.reviveRstNodeFromJson(this, json as RstNodeJson<RstDefinitionListItemData>)
            case RstNodeType.FieldList: return RstFieldList.reviveRstNodeFromJson(this, json)
            case RstNodeType.FieldListItem: return RstFieldListItem.reviveRstNodeFromJson(this, json as RstNodeJson<RstFieldListItemData>)
            case RstNodeType.OptionList: return RstOptionList.reviveRstNodeFromJson(this, json)
            case RstNodeType.OptionListItem: return RstOptionListItem.reviveRstNodeFromJson(this, json as RstNodeJson<OptionListItemData>)

            case RstNodeType.LiteralBlock: return RstLiteralBlock.reviveRstNodeFromJson(this, json as RstNodeJson<RstLiteralBlockData>)
            case RstNodeType.LineBlock: return RstLineBlock.reviveRstNodeFromJson(this, json)
            case RstNodeType.LineBlockLine: return RstLineBlockLine.reviveRstNodeFromJson(this, json)
            case RstNodeType.Blockquote: return RstBlockquote.reviveRstNodeFromJson(this, json)
            case RstNodeType.BlockquoteAttribution: return RstBlockquoteAttribution.reviveRstNodeFromJson(this, json)
            case RstNodeType.DoctestBlock: return RstDoctestBlock.reviveRstNodeFromJson(this, json as RstNodeJson<RstDoctestBlockData>)

            case RstNodeType.Table: return RstTable.reviveRstNodeFromJson(this, json as RstNodeJson<RstTableData>)
            case RstNodeType.TableRow: return RstTableRow.reviveRstNodeFromJson(this, json as RstNodeJson<RstTableRowData>)
            case RstNodeType.TableCell: return RstTableCell.reviveRstNodeFromJson(this, json as RstNodeJson<RstTableCellData>)

            case RstNodeType.FootnoteDefGroup: return RstFootnoteDefGroup.reviveRstNodeFromJson(this, json)
            case RstNodeType.FootnoteDef: return RstFootnoteDef.reviveRstNodeFromJson(this, json as RstNodeJson<RstFootnoteDefData>)
            case RstNodeType.CitationDefGroup: return RstCitationDefGroup.reviveRstNodeFromJson(this, json)
            case RstNodeType.CitationDef: return RstCitationDef.reviveRstNodeFromJson(this, json as RstNodeJson<RstCitationDefData>)
            case RstNodeType.HyperlinkTarget: return RstHyperlinkTarget.reviveRstNodeFromJson(this, json as RstNodeJson<RstHyperlinkTargetData>)
            case RstNodeType.Directive: return RstDirective.reviveRstNodeFromJson(this, json as RstNodeJson<RstDirectiveData>)
            case RstNodeType.SubstitutionDef: return RstSubstitutionDef.reviveRstNodeFromJson(this, json as RstNodeJson<RstSubstitutionDefData>)
            case RstNodeType.Comment: return RstComment.reviveRstNodeFromJson(this, json as RstNodeJson<RstCommentData>)

            default: return this.reviveRstTextFromJson(json)
        }
    }

    reviveRstTextFromJson(json: RstNodeJson): RstText {
        switch (json.type) {
            case RstNodeType.Text: return RstText.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case RstNodeType.StrongEmphasis: return RstStrongEmphasis.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case RstNodeType.Emphasis: return RstEmphasis.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case RstNodeType.InterpretedText: return RstInterpretedText.reviveRstNodeFromJson(this, json as RstNodeJson<RstInterpretedTextData>)
            case RstNodeType.InlineLiteral: return RstInlineLiteral.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case RstNodeType.SubstitutionRef: return RstSubstitutionRef.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case RstNodeType.InlineInternalTarget: return RstInlineInternalTarget.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case RstNodeType.FootnoteRef: return RstFootnoteRef.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case RstNodeType.CitationRef: return RstCitationRef.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case RstNodeType.HyperlinkRef: return RstHyperlinkRef.reviveRstNodeFromJson(this, json as RstNodeJson<RstHyperlinkRefData>)

            default: {
                throw new Error(`Unhandled nodeType:"${json.type}"`)
            }
        }
    }
}
