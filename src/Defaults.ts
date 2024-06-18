import { RstNodeGenerator } from './Generator/RstGenerator.js'
import { RstNodeParser } from './Parser/RstParser.js'
import { blockquoteParser, blockquoteGenerators } from './RstNode/Block/Blockquote.js'
import { blockquoteAttributionParser, blockquoteAttributonGenerators } from './RstNode/Block/BlockquoteAttribution.js'
import { docTestBlockGenerators, doctestBlockParser } from './RstNode/Block/DoctestBlock.js'
import { documentGenerators } from './RstNode/Block/Document.js'
import { lineBlockGenerators, lineBlockLineGenerators, lineBlockParser } from './RstNode/Block/LineBlock.js'
import { literalBlockParser, literalBlockGenerators } from './RstNode/Block/LiteralBlock.js'
import { paragraphParser, paragraphGenerators } from './RstNode/Block/Paragraph.js'
import { sectionParser, sectionGenerators } from './RstNode/Block/Section.js'
import { transitionGenerators, transitionParser } from './RstNode/Block/Transition.js'
import { citationDefGenerators } from './RstNode/ExplicitMarkup/CitationDef.js'
import { citationGroupParser, citationDefGroupGenerators } from './RstNode/ExplicitMarkup/CitationDefGroup.js'
import { commentParser, commentGenerators } from './RstNode/ExplicitMarkup/Comment.js'
import { directiveParser } from './RstNode/ExplicitMarkup/Directive.js'
import { footnoteDefGenerators } from './RstNode/ExplicitMarkup/FootnoteDef.js'
import { footnoteDefGroupParser, footnoteDefGroupGenerators } from './RstNode/ExplicitMarkup/FootnoteDefGroup.js'
import { hyperlinkTargetParser, hyperlinkTargetGenerators } from './RstNode/ExplicitMarkup/HyperlinkTarget.js'
import { substitutionDefParser, substitutionDefGenerators } from './RstNode/ExplicitMarkup/SubstitutionDef.js'
import { citationRefGenerators } from './RstNode/Inline/CitationRef.js'
import { emphasisGenerators } from './RstNode/Inline/Emphasis.js'
import { footnoteRefGenerators } from './RstNode/Inline/FootnoteRef.js'
import { hyperlinkRefGenerators } from './RstNode/Inline/HyperlinkRef.js'
import { inlineInternalTargetGenerators } from './RstNode/Inline/InlineInternalTarget.js'
import { inlineLiteralGenerators } from './RstNode/Inline/InlineLiteral.js'
import { strongEmphasisGenerators } from './RstNode/Inline/StrongEmphasis.js'
import { substitutionRefGenerators } from './RstNode/Inline/SubstitutionRef.js'
import { textGenerators } from './RstNode/Inline/Text.js'
import { bulletListParser, bulletListGenerators } from './RstNode/List/BulletList.js'
import { bulletListItemGenerators } from './RstNode/List/BulletListItem.js'
import { definitionListGenerators, definitionListParser } from './RstNode/List/DefinitionList.js'
import { definitionListItemGenerators } from './RstNode/List/DefinitionListItem.js'
import { enumeratedListParser, enumeratedListGenerators } from './RstNode/List/EnumeratedList.js'
import { fieldListParser, fieldListGenerators } from './RstNode/List/FieldList.js'
import { fieldListItemGenerators } from './RstNode/List/FieldListItem.js'
import { optionListParser, optionListGenerators } from './RstNode/List/OptionList.js'
import { optionListItemGenerators } from './RstNode/List/OptionListItem.js'
import { RstCompilerPlugin } from './RstCompilerPlugin.js'
import { onlyDirectivePlugin } from './Plugins/Only/OnlyPlugin.js'
import { tableGenerators } from './RstNode/Table/Table.js'
import { tableCellGenerators } from './RstNode/Table/TableCell.js'
import { tableRowGenerators } from './RstNode/Table/TableRow.js'
import { tableGridParser } from './RstNode/Table/gridTableParser.js'
import { tableSimpleParser } from './RstNode/Table/simpleTableParser.js'
import { containerDirectivePlugins } from './Plugins/Container/ContainerPlugin.js'
import { admonitionDirectivePlugins } from './Plugins/Admonition/AdmonitionPlugin.js'
import { mathPlugins } from './Plugins/Math/MathPlugin.js'
import { codePlugins } from './Plugins/Code/CodePlugin.js'
import { jsDomainPlugins } from './Plugins/Domains/Js/JsPlugin.js'
import { tabsDirectivePlugins } from './Plugins/Tabs/TabsPlugin.js'
import { tocTreeDirectivePlugins } from './Plugins/TocTree/TocTreePlugin.js'
import { centeredDirectivePlugins } from './Plugins/Centered/CenteredPlugin.js'
import { htmlClassDirectivePlugins } from './Plugins/HtmlClass/HtmlClassPlugin.js'
import { imageDirectivePlugins } from './Plugins/Image/ImagePlugin.js'
import { metaDirectivePlugins } from './Plugins/Meta/MetaPlugin.js'
import { tableDirectivePlugin } from './Plugins/Table/TablePlugin.js'
import { rawTextPlugins } from './Plugins/RawText/RawTextPlugin.js'
import { videoDirectivePlugins } from './Plugins/Video/VideoPlugin.js'
import { pepRfcInterpretedTextPlugins } from './Plugins/InterpretedText/PepRfcPlugin.js'
import { interpretedTextPlugins } from './Plugins/InterpretedText/InterpretedTextPlugin.js'

// ----------------------------------------------------------------------------
// MARK: Node Parsers
// ----------------------------------------------------------------------------

// Order matters here since this array determines priority
export const nodeParsers: ReadonlyArray<RstNodeParser> = [
    directiveParser,
    footnoteDefGroupParser,
    citationGroupParser,
    substitutionDefParser,
    hyperlinkTargetParser,
    commentParser,

    bulletListParser,
    enumeratedListParser,
    fieldListParser,
    optionListParser,
    definitionListParser,

    literalBlockParser,
    lineBlockParser,
    blockquoteAttributionParser,
    blockquoteParser,
    doctestBlockParser,
    tableGridParser,
    tableSimpleParser,

    sectionParser,
    transitionParser,
    paragraphParser,
]

// ----------------------------------------------------------------------------
// MARK: Node Generators
// ----------------------------------------------------------------------------

export const htmlNodeGenerators: ReadonlyArray<RstNodeGenerator> = [
    documentGenerators.htmlGenerator,
    sectionGenerators.htmlGenerator,
    transitionGenerators.htmlGenerator,
    paragraphGenerators.htmlGenerator,

    bulletListGenerators.htmlGenerator,
    bulletListItemGenerators.htmlGenerator,
    enumeratedListGenerators.htmlGenerator,
    definitionListGenerators.htmlGenerator,
    definitionListItemGenerators.htmlGenerator,
    fieldListGenerators.htmlGenerator,
    fieldListItemGenerators.htmlGenerator,
    optionListGenerators.htmlGenerator,
    optionListItemGenerators.htmlGenerator,

    literalBlockGenerators.htmlGenerator,
    lineBlockGenerators.htmlGenerator,
    lineBlockLineGenerators.htmlGenerator,
    blockquoteGenerators.htmlGenerator,
    blockquoteAttributonGenerators.htmlGenerator,
    docTestBlockGenerators.htmlGenerator,
    tableGenerators.htmlGenerator,
    tableRowGenerators.htmlGenerator,
    tableCellGenerators.htmlGenerator,

    footnoteDefGenerators.htmlGenerator,
    footnoteDefGroupGenerators.htmlGenerator,
    citationDefGenerators.htmlGenerator,
    citationDefGroupGenerators.htmlGenerator,
    hyperlinkTargetGenerators.htmlGenerator,
    substitutionDefGenerators.htmlGenerator,
    commentGenerators.htmlGenerator,

    textGenerators.htmlGenerator,
    strongEmphasisGenerators.htmlGenerator,
    emphasisGenerators.htmlGenerator,
    inlineLiteralGenerators.htmlGenerator,
    substitutionRefGenerators.htmlGenerator,
    inlineInternalTargetGenerators.htmlGenerator,
    footnoteRefGenerators.htmlGenerator,
    citationRefGenerators.htmlGenerator,
    hyperlinkRefGenerators.htmlGenerator,
]

export const mdNodeGenerators: ReadonlyArray<RstNodeGenerator> = [
    documentGenerators.mdGenerator,
    sectionGenerators.mdGenerator,
    transitionGenerators.mdGenerator,
    paragraphGenerators.mdGenerator,

    bulletListGenerators.mdGenerator,
    bulletListItemGenerators.mdGenerator,
    enumeratedListGenerators.mdGenerator,
    definitionListGenerators.mdGenerator,
    definitionListItemGenerators.mdGenerator,
    fieldListGenerators.mdGenerator,
    fieldListItemGenerators.mdGenerator,
    optionListGenerators.mdGenerator,
    optionListItemGenerators.mdGenerator,

    literalBlockGenerators.mdGenerator,
    lineBlockGenerators.mdGenerator,
    lineBlockLineGenerators.mdGenerator,
    blockquoteGenerators.mdGenerator,
    blockquoteAttributonGenerators.mdGenerator,
    docTestBlockGenerators.mdGenerator,
    tableGenerators.mdGenerator,
    tableRowGenerators.mdGenerator,
    tableCellGenerators.mdGenerator,

    footnoteDefGenerators.mdGenerator,
    footnoteDefGroupGenerators.mdGenerator,
    citationDefGenerators.mdGenerator,
    citationDefGroupGenerators.mdGenerator,
    hyperlinkTargetGenerators.mdGenerator,
    substitutionDefGenerators.mdGenerator,
    commentGenerators.mdGenerator,

    textGenerators.mdGenerator,
    strongEmphasisGenerators.mdGenerator,
    emphasisGenerators.mdGenerator,
    inlineLiteralGenerators.mdGenerator,
    substitutionRefGenerators.mdGenerator,
    inlineInternalTargetGenerators.mdGenerator,
    footnoteRefGenerators.mdGenerator,
    citationRefGenerators.mdGenerator,
    hyperlinkRefGenerators.mdGenerator,
]

// ----------------------------------------------------------------------------
// MARK: Plugins
// ----------------------------------------------------------------------------

export const htmlPlugins: ReadonlyArray<RstCompilerPlugin> = [
    admonitionDirectivePlugins.htmlPlugin,
    centeredDirectivePlugins.htmlPlugin,
    codePlugins.htmlPlugin,
    containerDirectivePlugins.htmlPlugin,
    htmlClassDirectivePlugins.htmlPlugin,
    imageDirectivePlugins.htmlPlugin,
    interpretedTextPlugins.htmlPlugin,
    jsDomainPlugins.htmlPlugin,
    mathPlugins.htmlPlugin,
    metaDirectivePlugins.htmlPlugin,
    onlyDirectivePlugin,
    pepRfcInterpretedTextPlugins.htmlPlugin,
    rawTextPlugins.htmlPlugin,
    tableDirectivePlugin.htmlPlugin,
    tabsDirectivePlugins.htmlPlugin,
    tocTreeDirectivePlugins.htmlPlugin,
    videoDirectivePlugins.htmlPlugin,
]

export const mdPlugins: ReadonlyArray<RstCompilerPlugin> = [
    admonitionDirectivePlugins.mdPlugin,
    centeredDirectivePlugins.mdPlugin,
    codePlugins.mdPlugin,
    containerDirectivePlugins.mdPlugin,
    htmlClassDirectivePlugins.mdPlugin,
    imageDirectivePlugins.mdPlugin,
    interpretedTextPlugins.mdPlugin,
    jsDomainPlugins.mdPlugin,
    mathPlugins.mdPlugin,
    metaDirectivePlugins.mdPlugin,
    onlyDirectivePlugin,
    pepRfcInterpretedTextPlugins.mdPlugin,
    rawTextPlugins.mdPlugin,
    tableDirectivePlugin.mdPlugin,
    tabsDirectivePlugins.mdPlugin,
    tocTreeDirectivePlugins.mdPlugin,
    videoDirectivePlugins.mdPlugin,
]
