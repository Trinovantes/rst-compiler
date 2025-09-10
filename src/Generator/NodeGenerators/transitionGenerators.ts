import { createNodeGenerators } from '../RstGenerator.js'

export const transitionGenerators = createNodeGenerators(
    'Transition',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('hr', node)
    },

    (generatorState) => {
        generatorState.writeLine('---')
    },
)
