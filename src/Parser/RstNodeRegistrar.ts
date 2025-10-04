import type { Brand } from '../@types/Brand.ts'
import { RstBlockquote } from '../RstNode/Block/Blockquote.ts'
import { RstBlockquoteAttribution } from '../RstNode/Block/BlockquoteAttribution.ts'
import { RstDoctestBlock, type RstDoctestBlockData } from '../RstNode/Block/DoctestBlock.ts'
import { RstDocument, type RstDocumentData } from '../RstNode/Block/Document.ts'
import { RstLineBlock, RstLineBlockLine } from '../RstNode/Block/LineBlock.ts'
import { RstLiteralBlock, type RstLiteralBlockData } from '../RstNode/Block/LiteralBlock.ts'
import { RstParagraph } from '../RstNode/Block/Paragraph.ts'
import { RstSection, type RstSectionData } from '../RstNode/Block/Section.ts'
import { RstTransition } from '../RstNode/Block/Transition.ts'
import { RstCitationDef, type RstCitationDefData } from '../RstNode/ExplicitMarkup/CitationDef.ts'
import { RstCitationDefGroup } from '../RstNode/ExplicitMarkup/CitationDefGroup.ts'
import { RstComment, type RstCommentData } from '../RstNode/ExplicitMarkup/Comment.ts'
import { RstDirective, type RstDirectiveData } from '../RstNode/ExplicitMarkup/Directive.ts'
import { RstFootnoteDef, type RstFootnoteDefData } from '../RstNode/ExplicitMarkup/FootnoteDef.ts'
import { RstFootnoteDefGroup } from '../RstNode/ExplicitMarkup/FootnoteDefGroup.ts'
import { RstHyperlinkTarget, type RstHyperlinkTargetData } from '../RstNode/ExplicitMarkup/HyperlinkTarget.ts'
import { RstSubstitutionDef, type RstSubstitutionDefData } from '../RstNode/ExplicitMarkup/SubstitutionDef.ts'
import { RstCitationRef } from '../RstNode/Inline/CitationRef.ts'
import { RstEmphasis } from '../RstNode/Inline/Emphasis.ts'
import { RstFootnoteRef } from '../RstNode/Inline/FootnoteRef.ts'
import { RstHyperlinkRef, type RstHyperlinkRefData } from '../RstNode/Inline/HyperlinkRef.ts'
import { RstInlineInternalTarget } from '../RstNode/Inline/InlineInternalTarget.ts'
import { RstInlineLiteral } from '../RstNode/Inline/InlineLiteral.ts'
import { RstInterpretedText, type RstInterpretedTextData } from '../RstNode/Inline/InterpretedText.ts'
import { RstStrongEmphasis } from '../RstNode/Inline/StrongEmphasis.ts'
import { RstSubstitutionRef } from '../RstNode/Inline/SubstitutionRef.ts'
import { RstText, type RstTextData } from '../RstNode/Inline/Text.ts'
import { RstBulletList } from '../RstNode/List/BulletList.ts'
import { RstBulletListItem, type RstBulletListItemData } from '../RstNode/List/BulletListItem.ts'
import { RstDefinitionList } from '../RstNode/List/DefinitionList.ts'
import { RstDefinitionListItem, type RstDefinitionListItemData } from '../RstNode/List/DefinitionListItem.ts'
import { RstEnumeratedList, type RstEnumeratedListData } from '../RstNode/List/EnumeratedList.ts'
import { RstFieldList } from '../RstNode/List/FieldList.ts'
import { RstFieldListItem, type RstFieldListItemData } from '../RstNode/List/FieldListItem.ts'
import { RstOptionList } from '../RstNode/List/OptionList.ts'
import { RstOptionListItem, type OptionListItemData } from '../RstNode/List/OptionListItem.ts'
import { RstNode, type RstNodeJson } from '../RstNode/RstNode.ts'
import type { RstNodeType } from '../RstNode/RstNodeType.ts'
import { RstTable, type RstTableData } from '../RstNode/Table/Table.ts'
import { RstTableCell, type RstTableCellData } from '../RstNode/Table/TableCell.ts'
import { RstTableRow, type RstTableRowData } from '../RstNode/Table/TableRow.ts'

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
