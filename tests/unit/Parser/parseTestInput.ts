import { RstParser } from '@/index.js'

export function parseTestInput(input: string) {
    input = input.replace(/^\n+/, '') // Remove all newlines at start
    input = input.replace(/\n+$/, '') // Remove all newlines at end

    const indent = /^([ ]*)/.exec(input)?.[1] // Assume first line of test is base indent for every remaining line
    const lines = input
        .split('\n')
        .map((line) => line.replace(new RegExp(`^${indent}`), '')) // Remove base indent from every line
        .map((line) => line.trimEnd()) // Remove trailing whitespace from every line

    const parser = new RstParser()
    return parser.parse(lines.join('\n'))
}
