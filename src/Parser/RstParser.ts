import type { RstNode } from '../RstNode/RstNode.ts'
import type { RstParserState } from './RstParserState.ts'
import type { RstNodeMap } from '../RstNode/RstNodeMap.ts'
import type { RstNodeType } from '../RstNode/RstNodeType.ts'

type RstNodeParserInstance<T extends keyof RstNodeMap> = Readonly<{
    onParseShouldExitBody?: boolean
    parse: (parserState: RstParserState, indentSize: number, parentType: RstNodeType, prevNode?: RstNode) => RstNodeMap[T] | null
}>

export type RstNodeParser<T extends keyof RstNodeMap = keyof RstNodeMap> = T extends keyof RstNodeMap
    ? RstNodeParserInstance<T>
    : never
