import { createInterpretedTextGenerators } from '../../Generator/RstGenerator.js'
import { RstGeneratorError } from '../../Generator/RstGeneratorError.js'
import type { RstGeneratorState } from '../../Generator/RstGeneratorState.js'
import { createRstCompilerPlugins } from '../../RstCompilerPlugin.js'
import { RstInterpretedText } from '../../RstNode/Inline/InterpretedText.js'

const pepRe = /^(?<pep>\d+)$/
const rfcRe = /^(?<rfc>\d+)(?<anchor>#.+)?$/

// ----------------------------------------------------------------------------
// MARK: InterpretedText
// ----------------------------------------------------------------------------

export const pepInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'pep-reference',
        'PEP',
    ],

    (generatorState, node) => {
        const { label, url } = getPepInfo(generatorState, node)
        generatorState.writeTextWithLinePrefix(`<a href="${url}">${label}</a>`)
    },

    (generatorState, node) => {
        const { label, url } = getPepInfo(generatorState, node)
        generatorState.writeTextWithLinePrefix(`[${label}](${url})`)
    },
)

export const rfcInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'rfc-reference',
        'RFC',
    ],

    (generatorState, node) => {
        const { label, url } = getRfcInfo(generatorState, node)
        generatorState.writeTextWithLinePrefix(`<a href="${url}">${label}</a>`)
    },

    (generatorState, node) => {
        const { label, url } = getRfcInfo(generatorState, node)
        generatorState.writeTextWithLinePrefix(`[${label}](${url})`)
    },
)

// ----------------------------------------------------------------------------
// MARK: Plugin
// ----------------------------------------------------------------------------

export const pepRfcInterpretedTextPlugins = createRstCompilerPlugins({
    interpretedTextGenerators: [
        pepInterpretedTextGenerators,
        rfcInterpretedTextGenerators,
    ],

    isValidInterpretedText: (rawBodyText, role) => {
        if (pepInterpretedTextGenerators.roles.includes(role)) {
            return pepRe.test(rawBodyText)
        }

        if (rfcInterpretedTextGenerators.roles.includes(role)) {
            return rfcRe.test(rawBodyText)
        }

        return null
    },
})

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function getPepInfo(generatorState: RstGeneratorState, node: RstInterpretedText) {
    const pep = pepRe.exec(node.textContent)?.groups?.pep
    if (!pep) {
        throw new RstGeneratorError(generatorState, 'Invalid PEP')
    }

    const label = `PEP ${pep}`
    const url = `https://peps.python.org/pep-${pep.padStart(4, '0')}`

    return {
        label,
        url,
    }
}

function getRfcInfo(generatorState: RstGeneratorState, node: RstInterpretedText) {
    const match = rfcRe.exec(node.textContent)
    const rfc = match?.groups?.rfc
    if (!rfc) {
        throw new RstGeneratorError(generatorState, 'Invalid RFC')
    }

    const label = `RFC ${rfc}`
    const anchor = match?.groups?.anchor
    const url = anchor
        ? `https://tools.ietf.org/html/rfc${rfc}.html#${anchor}`
        : `https://tools.ietf.org/html/rfc${rfc}.html`

    return {
        label,
        url,
    }
}
