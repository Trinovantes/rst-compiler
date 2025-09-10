import type { RstNodeGenerator } from './Generator/RstGenerator.js'
import type { RstNodeParser } from './Parser/RstParser.js'
import type { RstCompilerPlugin } from './RstCompilerPlugin.js'
import { onlyDirectivePlugin } from './Plugins/Only/OnlyPlugin.js'
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
import { rubricDirectivePlugin } from './Plugins/Rubric/RubricPlugin.js'
import { contentsDirectivePlugins } from './Plugins/Contents/ContentsPlugin.js'
import { citationGroupParser } from './Parser/NodeParsers/citationGroupParser.js'
import { directiveParser } from './Parser/NodeParsers/directiveParser.js'
import { footnoteDefGroupParser } from './Parser/NodeParsers/footnoteDefGroupParser.js'
import { commentParser } from './Parser/NodeParsers/commentParser.js'
import { hyperlinkTargetParser } from './Parser/NodeParsers/hyperlinkTargetParser.js'
import { literalBlockParser } from './Parser/NodeParsers/literalBlockParser.js'
import { paragraphParser } from './Parser/NodeParsers/paragraphParser.js'
import { sectionParser } from './Parser/NodeParsers/sectionParser.js'
import { substitutionDefParser } from './Parser/NodeParsers/substitutionDefParser.js'
import { transitionParser } from './Parser/NodeParsers/transitionParser.js'
import { blockquoteAttributionParser } from './Parser/NodeParsers/blockquoteAttributionParser.js'
import { blockquoteParser } from './Parser/NodeParsers/blockquoteParser.js'
import { doctestBlockParser } from './Parser/NodeParsers/doctestBlockParser.js'
import { lineBlockParser } from './Parser/NodeParsers/lineBlockParser.js'
import { tableGridParser } from './Parser/NodeParsers/tableGridParser.js'
import { tableSimpleParser } from './Parser/NodeParsers/tableSimpleParser.js'
import { bulletListParser } from './Parser/NodeParsers/bulletListParser.js'
import { definitionListParser } from './Parser/NodeParsers/definitionListParser.js'
import { enumeratedListParser } from './Parser/NodeParsers/enumeratedListParser.js'
import { fieldListParser } from './Parser/NodeParsers/fieldListParser.js'
import { optionListParser } from './Parser/NodeParsers/optionListParser.js'
import { paragraphGenerators } from './Generator/NodeGenerators/paragraphGenerators.js'
import { blockquoteAttributonGenerators, blockquoteGenerators } from './Generator/NodeGenerators/blockquoteGenerators.js'
import { bulletListGenerators, bulletListItemGenerators } from './Generator/NodeGenerators/bulletListGenerators.js'
import { citationDefGenerators, citationDefGroupGenerators } from './Generator/NodeGenerators/citationDefGenerators.js'
import { commentGenerators } from './Generator/NodeGenerators/commentGenerators.js'
import { definitionListGenerators, definitionListItemGenerators } from './Generator/NodeGenerators/definitionListGenerators.js'
import { docTestBlockGenerators } from './Generator/NodeGenerators/docTestBlockGenerators.js'
import { documentGenerators } from './Generator/NodeGenerators/documentGenerators.js'
import { enumeratedListGenerators } from './Generator/NodeGenerators/enumeratedListGenerators.js'
import { fieldListGenerators, fieldListItemGenerators } from './Generator/NodeGenerators/fieldListGenerators.js'
import { footnoteDefGenerators, footnoteDefGroupGenerators } from './Generator/NodeGenerators/footnoteDefGenerators.js'
import { hyperlinkRefGenerators } from './Generator/NodeGenerators/hyperlinkRefGenerators.js'
import { hyperlinkTargetGenerators } from './Generator/NodeGenerators/hyperlinkTargetGenerators.js'
import { inlineInternalTargetGenerators } from './Generator/NodeGenerators/inlineInternalTargetGenerators.js'
import { lineBlockGenerators, lineBlockLineGenerators } from './Generator/NodeGenerators/lineBlockGenerators.js'
import { literalBlockGenerators } from './Generator/NodeGenerators/literalBlockGenerators.js'
import { optionListGenerators, optionListItemGenerators } from './Generator/NodeGenerators/optionListGenerators.js'
import { sectionGenerators } from './Generator/NodeGenerators/sectionGenerators.js'
import { substitutionDefGenerators } from './Generator/NodeGenerators/substitutionDefGenerators.js'
import { substitutionRefGenerators } from './Generator/NodeGenerators/substitutionRefGenerators.js'
import { tableCellGenerators, tableGenerators, tableRowGenerators } from './Generator/NodeGenerators/tableGenerators.js'
import { emphasisGenerators, inlineLiteralGenerators, strongEmphasisGenerators, textGenerators } from './Generator/NodeGenerators/textGenerators.js'
import { transitionGenerators } from './Generator/NodeGenerators/transitionGenerators.js'
import { citationRefGenerators } from './Generator/NodeGenerators/citationRefGenerators.js'
import { footnoteRefGenerators } from './Generator/NodeGenerators/footnoteRefGenerators.js'

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
