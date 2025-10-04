import { createInterpretedTextGenerators } from '../../../Generator/RstGenerator.ts'
import { parseAbbr } from '../../../utils/parseAbbr.ts'
import { sanitizeHtml } from '../../../utils/sanitizeHtml.ts'

export const abbreviationInterpretedTextGenerators = createInterpretedTextGenerators(
    [
        'abbreviation',
        'abbr',
        'ab',
    ],

    (generatorState, node) => {
        const abbr = parseAbbr(node.rawTextContent)
        if (abbr.longForm) {
            generatorState.writeTextWithLinePrefix(`<abbr title="${sanitizeHtml(abbr.longForm)}">${sanitizeHtml(abbr.shortForm)}</abbr>`)
        } else {
            generatorState.writeTextWithLinePrefix(`<abbr>${sanitizeHtml(abbr.shortForm)}</abbr>`)
        }
    },
)
