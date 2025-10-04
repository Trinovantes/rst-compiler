import { createNodeGenerators } from '../RstGenerator.ts'

export const transitionGenerators = createNodeGenerators(
    'Transition',

    (generatorState, node) => {
        generatorState.writeLineHtmlTag('hr', node)
    },

    (generatorState) => {
        generatorState.writeLine('---')
    },
)
