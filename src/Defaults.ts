import type { RstNodeGenerator } from './Generator/RstGenerator.ts'
import type { RstNodeParser } from './Parser/RstParser.ts'
import type { RstCompilerPlugin } from './RstCompilerPlugin.ts'
import { onlyDirectivePlugin } from './Plugins/Only/OnlyPlugin.ts'
import { containerDirectivePlugins } from './Plugins/Container/ContainerPlugin.ts'
import { admonitionDirectivePlugins } from './Plugins/Admonition/AdmonitionPlugin.ts'
import { mathPlugins } from './Plugins/Math/MathPlugin.ts'
import { codePlugins } from './Plugins/Code/CodePlugin.ts'
import { jsDomainPlugins } from './Plugins/Domains/Js/JsPlugin.ts'
import { tabsDirectivePlugins } from './Plugins/Tabs/TabsPlugin.ts'
import { tocTreeDirectivePlugins } from './Plugins/TocTree/TocTreePlugin.ts'
import { centeredDirectivePlugins } from './Plugins/Centered/CenteredPlugin.ts'
import { htmlClassDirectivePlugins } from './Plugins/HtmlClass/HtmlClassPlugin.ts'
import { imageDirectivePlugins } from './Plugins/Image/ImagePlugin.ts'
import { metaDirectivePlugins } from './Plugins/Meta/MetaPlugin.ts'
import { tableDirectivePlugin } from './Plugins/Table/TablePlugin.ts'
import { rawTextPlugins } from './Plugins/RawText/RawTextPlugin.ts'
import { videoDirectivePlugins } from './Plugins/Video/VideoPlugin.ts'
import { pepRfcInterpretedTextPlugins } from './Plugins/InterpretedText/PepRfcPlugin.ts'
import { interpretedTextPlugins } from './Plugins/InterpretedText/InterpretedTextPlugin.ts'
import { rubricDirectivePlugin } from './Plugins/Rubric/RubricPlugin.ts'
import { contentsDirectivePlugins } from './Plugins/Contents/ContentsPlugin.ts'
import { citationGroupParser } from './Parser/NodeParsers/citationGroupParser.ts'
import { directiveParser } from './Parser/NodeParsers/directiveParser.ts'
import { footnoteDefGroupParser } from './Parser/NodeParsers/footnoteDefGroupParser.ts'
import { commentParser } from './Parser/NodeParsers/commentParser.ts'
import { hyperlinkTargetParser } from './Parser/NodeParsers/hyperlinkTargetParser.ts'
import { literalBlockParser } from './Parser/NodeParsers/literalBlockParser.ts'
import { paragraphParser } from './Parser/NodeParsers/paragraphParser.ts'
import { sectionParser } from './Parser/NodeParsers/sectionParser.ts'
import { substitutionDefParser } from './Parser/NodeParsers/substitutionDefParser.ts'
import { transitionParser } from './Parser/NodeParsers/transitionParser.ts'
import { blockquoteAttributionParser } from './Parser/NodeParsers/blockquoteAttributionParser.ts'
import { blockquoteParser } from './Parser/NodeParsers/blockquoteParser.ts'
import { doctestBlockParser } from './Parser/NodeParsers/doctestBlockParser.ts'
import { lineBlockParser } from './Parser/NodeParsers/lineBlockParser.ts'
import { tableGridParser } from './Parser/NodeParsers/tableGridParser.ts'
import { tableSimpleParser } from './Parser/NodeParsers/tableSimpleParser.ts'
import { bulletListParser } from './Parser/NodeParsers/bulletListParser.ts'
import { definitionListParser } from './Parser/NodeParsers/definitionListParser.ts'
import { enumeratedListParser } from './Parser/NodeParsers/enumeratedListParser.ts'
import { fieldListParser } from './Parser/NodeParsers/fieldListParser.ts'
import { optionListParser } from './Parser/NodeParsers/optionListParser.ts'
import { paragraphGenerators } from './Generator/NodeGenerators/paragraphGenerators.ts'
import { blockquoteAttributonGenerators, blockquoteGenerators } from './Generator/NodeGenerators/blockquoteGenerators.ts'
import { bulletListGenerators, bulletListItemGenerators } from './Generator/NodeGenerators/bulletListGenerators.ts'
import { citationDefGenerators, citationDefGroupGenerators } from './Generator/NodeGenerators/citationDefGenerators.ts'
import { commentGenerators } from './Generator/NodeGenerators/commentGenerators.ts'
import { definitionListGenerators, definitionListItemGenerators } from './Generator/NodeGenerators/definitionListGenerators.ts'
import { docTestBlockGenerators } from './Generator/NodeGenerators/docTestBlockGenerators.ts'
import { documentGenerators } from './Generator/NodeGenerators/documentGenerators.ts'
import { enumeratedListGenerators } from './Generator/NodeGenerators/enumeratedListGenerators.ts'
import { fieldListGenerators, fieldListItemGenerators } from './Generator/NodeGenerators/fieldListGenerators.ts'
import { footnoteDefGenerators, footnoteDefGroupGenerators } from './Generator/NodeGenerators/footnoteDefGenerators.ts'
import { hyperlinkRefGenerators } from './Generator/NodeGenerators/hyperlinkRefGenerators.ts'
import { hyperlinkTargetGenerators } from './Generator/NodeGenerators/hyperlinkTargetGenerators.ts'
import { inlineInternalTargetGenerators } from './Generator/NodeGenerators/inlineInternalTargetGenerators.ts'
import { lineBlockGenerators, lineBlockLineGenerators } from './Generator/NodeGenerators/lineBlockGenerators.ts'
import { literalBlockGenerators } from './Generator/NodeGenerators/literalBlockGenerators.ts'
import { optionListGenerators, optionListItemGenerators } from './Generator/NodeGenerators/optionListGenerators.ts'
import { sectionGenerators } from './Generator/NodeGenerators/sectionGenerators.ts'
import { substitutionDefGenerators } from './Generator/NodeGenerators/substitutionDefGenerators.ts'
import { substitutionRefGenerators } from './Generator/NodeGenerators/substitutionRefGenerators.ts'
import { tableCellGenerators, tableGenerators, tableRowGenerators } from './Generator/NodeGenerators/tableGenerators.ts'
import { emphasisGenerators, inlineLiteralGenerators, strongEmphasisGenerators, textGenerators } from './Generator/NodeGenerators/textGenerators.ts'
import { transitionGenerators } from './Generator/NodeGenerators/transitionGenerators.ts'
import { citationRefGenerators } from './Generator/NodeGenerators/citationRefGenerators.ts'
import { footnoteRefGenerators } from './Generator/NodeGenerators/footnoteRefGenerators.ts'

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
    contentsDirectivePlugins.htmlPlugin,
    htmlClassDirectivePlugins.htmlPlugin,
    imageDirectivePlugins.htmlPlugin,
    interpretedTextPlugins.htmlPlugin,
    jsDomainPlugins.htmlPlugin,
    mathPlugins.htmlPlugin,
    metaDirectivePlugins.htmlPlugin,
    onlyDirectivePlugin,
    pepRfcInterpretedTextPlugins.htmlPlugin,
    rawTextPlugins.htmlPlugin,
    rubricDirectivePlugin.htmlPlugin,
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
    contentsDirectivePlugins.mdPlugin,
    htmlClassDirectivePlugins.mdPlugin,
    imageDirectivePlugins.mdPlugin,
    interpretedTextPlugins.mdPlugin,
    jsDomainPlugins.mdPlugin,
    mathPlugins.mdPlugin,
    metaDirectivePlugins.mdPlugin,
    onlyDirectivePlugin,
    pepRfcInterpretedTextPlugins.mdPlugin,
    rawTextPlugins.mdPlugin,
    rubricDirectivePlugin.mdPlugin,
    tableDirectivePlugin.mdPlugin,
    tabsDirectivePlugins.mdPlugin,
    tocTreeDirectivePlugins.mdPlugin,
    videoDirectivePlugins.mdPlugin,
]
