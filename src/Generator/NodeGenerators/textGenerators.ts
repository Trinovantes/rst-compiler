import { sanitizeHtml } from '../../utils/sanitizeHtml.js'
import { createNodeGenerators } from '../RstGenerator.js'

// ----------------------------------------------------------------------------
// MARK: Text
// ----------------------------------------------------------------------------

export const textGenerators = createNodeGenerators(
    'Text',

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(sanitizeHtml(node.textContent))
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(sanitizeHtml(node.textContent))
    },
)

// ----------------------------------------------------------------------------
// MARK: Emphasis
// ----------------------------------------------------------------------------

export const emphasisGenerators = createNodeGenerators(
    'Emphasis',

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<em>${sanitizeHtml(node.textContent)}</em>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`*${sanitizeHtml(node.textContent)}*`)
    },
)

// ----------------------------------------------------------------------------
// MARK: StrongEmphasis
// ----------------------------------------------------------------------------

export const strongEmphasisGenerators = createNodeGenerators(
    'StrongEmphasis',

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`<strong>${sanitizeHtml(node.textContent)}</strong>`)
    },

    (generatorState, node) => {
        generatorState.writeTextWithLinePrefix(`**${sanitizeHtml(node.textContent)}**`)
    },
)

// ----------------------------------------------------------------------------
// MARK: InlineLiteral
// ----------------------------------------------------------------------------

export const inlineLiteralGenerators = createNodeGenerators(
    'InlineLiteral',

    (generatorState, node) => {
        generatorState.writeText(`<span class="${generatorState.opts.htmlClass.literalInline}">${sanitizeHtml(node.textContent)}</span>`)
    },

    (generatorState, node) => {
        generatorState.writeText(`\`${node.textContent}\``) // Don't sanitize since this is written inside literal text
    },
)
