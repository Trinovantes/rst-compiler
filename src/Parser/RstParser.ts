import type { RstNode } from '@/RstNode/RstNode.js'
import type { RstParserState } from './RstParserState.js'
import type { RstNodeMap } from '@/RstNode/RstNodeMap.js'
import type { RstNodeType } from '@/RstNode/RstNodeType.js'

type RstNodeParserInstance<T extends keyof RstNodeMap> = Readonly<{
    onParseShouldExitBody?: boolean
    parse: (parserState: RstParserState, indentSize: number, parentType: RstNodeType, prevNode?: RstNode) => RstNodeMap[T] | null
}>

export type RstNodeParser<T extends keyof RstNodeMap = keyof RstNodeMap> = T extends keyof RstNodeMap
    ? RstNodeParserInstance<T>
    : never
