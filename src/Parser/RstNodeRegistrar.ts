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
            case 'Document': return RstDocument.reviveRstNodeFromJson(this, json as RstNodeJson<RstDocumentData>)

            case 'Section': return RstSection.reviveRstNodeFromJson(this, json as RstNodeJson<RstSectionData>)
            case 'Transition': return RstTransition.reviveRstNodeFromJson(this, json)
            case 'Paragraph': return RstParagraph.reviveRstNodeFromJson(this, json)

            case 'BulletList': return RstBulletList.reviveRstNodeFromJson(this, json)
            case 'BulletListItem': return RstBulletListItem.reviveRstNodeFromJson(this, json as RstNodeJson<RstBulletListItemData>)
            case 'EnumeratedList': return RstEnumeratedList.reviveRstNodeFromJson(this, json as RstNodeJson<RstEnumeratedListData>)
            case 'DefinitionList': return RstDefinitionList.reviveRstNodeFromJson(this, json)
            case 'DefinitionListItem': return RstDefinitionListItem.reviveRstNodeFromJson(this, json as RstNodeJson<RstDefinitionListItemData>)
            case 'FieldList': return RstFieldList.reviveRstNodeFromJson(this, json)
            case 'FieldListItem': return RstFieldListItem.reviveRstNodeFromJson(this, json as RstNodeJson<RstFieldListItemData>)
            case 'OptionList': return RstOptionList.reviveRstNodeFromJson(this, json)
            case 'OptionListItem': return RstOptionListItem.reviveRstNodeFromJson(this, json as RstNodeJson<OptionListItemData>)

            case 'LiteralBlock': return RstLiteralBlock.reviveRstNodeFromJson(this, json as RstNodeJson<RstLiteralBlockData>)
            case 'LineBlock': return RstLineBlock.reviveRstNodeFromJson(this, json)
            case 'LineBlockLine': return RstLineBlockLine.reviveRstNodeFromJson(this, json)
            case 'Blockquote': return RstBlockquote.reviveRstNodeFromJson(this, json)
            case 'BlockquoteAttribution': return RstBlockquoteAttribution.reviveRstNodeFromJson(this, json)
            case 'DoctestBlock': return RstDoctestBlock.reviveRstNodeFromJson(this, json as RstNodeJson<RstDoctestBlockData>)

            case 'Table': return RstTable.reviveRstNodeFromJson(this, json as RstNodeJson<RstTableData>)
            case 'TableRow': return RstTableRow.reviveRstNodeFromJson(this, json as RstNodeJson<RstTableRowData>)
            case 'TableCell': return RstTableCell.reviveRstNodeFromJson(this, json as RstNodeJson<RstTableCellData>)

            case 'FootnoteDefGroup': return RstFootnoteDefGroup.reviveRstNodeFromJson(this, json)
            case 'FootnoteDef': return RstFootnoteDef.reviveRstNodeFromJson(this, json as RstNodeJson<RstFootnoteDefData>)
            case 'CitationDefGroup': return RstCitationDefGroup.reviveRstNodeFromJson(this, json)
            case 'CitationDef': return RstCitationDef.reviveRstNodeFromJson(this, json as RstNodeJson<RstCitationDefData>)
            case 'HyperlinkTarget': return RstHyperlinkTarget.reviveRstNodeFromJson(this, json as RstNodeJson<RstHyperlinkTargetData>)
            case 'Directive': return RstDirective.reviveRstNodeFromJson(this, json as RstNodeJson<RstDirectiveData>)
            case 'SubstitutionDef': return RstSubstitutionDef.reviveRstNodeFromJson(this, json as RstNodeJson<RstSubstitutionDefData>)
            case 'Comment': return RstComment.reviveRstNodeFromJson(this, json as RstNodeJson<RstCommentData>)

            default: return this.reviveRstTextFromJson(json)
        }
    }

    reviveRstTextFromJson(json: RstNodeJson): RstText {
        switch (json.type) {
            case 'Text': return RstText.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case 'StrongEmphasis': return RstStrongEmphasis.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case 'Emphasis': return RstEmphasis.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case 'InterpretedText': return RstInterpretedText.reviveRstNodeFromJson(this, json as RstNodeJson<RstInterpretedTextData>)
            case 'InlineLiteral': return RstInlineLiteral.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case 'SubstitutionRef': return RstSubstitutionRef.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case 'InlineInternalTarget': return RstInlineInternalTarget.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case 'FootnoteRef': return RstFootnoteRef.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case 'CitationRef': return RstCitationRef.reviveRstNodeFromJson(this, json as RstNodeJson<RstTextData>)
            case 'HyperlinkRef': return RstHyperlinkRef.reviveRstNodeFromJson(this, json as RstNodeJson<RstHyperlinkRefData>)

            default: {
                throw new Error(`Unhandled nodeType:"${json.type}"`)
            }
        }
    }
}
