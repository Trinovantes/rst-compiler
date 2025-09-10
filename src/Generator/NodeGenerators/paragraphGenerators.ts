import { createNodeGenerators } from '../RstGenerator.js'

export const paragraphGenerators = createNodeGenerators(
    'Paragraph',

    (generatorState, node) => {
        const outputText = node.getOutputText(generatorState)
        if (outputText === null) {
            generatorState.writeLineHtmlComment(node.textContent)
            return
        }

        generatorState.writeLineHtmlTag('p', node, () => {
            generatorState.writeLine(outputText)
        })
    },

    (generatorState, node) => {
        const outputText = node.getOutputText(generatorState)
        if (outputText === null) {
            generatorState.writeLineMdComment(node.textContent)
            return
        }

        generatorState.writeLine(outputText)
    },
)
