import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNode, RstNodeSource } from '@/RstNode/RstNode.js'
import { RstBulletList } from '@/RstNode/List/BulletList.js'
import { RstEnumeratedList } from '@/RstNode/List/EnumeratedList.js'
import { RstFieldList } from '@/RstNode/List/FieldList.js'
import { RstOptionList } from '@/RstNode/List/OptionList.js'
import { RstDefinitionList } from '@/RstNode/List/DefinitionList.js'
import { isSequentialBullet } from '@/RstNode/List/EnumeratedListType.js'
import { RstBulletListItem } from '@/RstNode/List/BulletListItem.js'

export function mergeSequentialLists(registrar: RstNodeRegistrar, nodes: ReadonlyArray<RstNode>): ReadonlyArray<RstNode> {
    if (nodes.length === 0) {
        return []
    }

    const mergedNodes = new Array<RstNode>()
    mergedNodes.push(nodes[0])

    for (let i = 1; i < nodes.length; i++) {
        const prevNode = mergedNodes[mergedNodes.length - 1]
        const currNode = nodes[i]

        const mergedSource: RstNodeSource = { startLineIdx: prevNode.source.startLineIdx, endLineIdx: currNode.source.endLineIdx }
        const mergedChildren = [...prevNode.children, ...currNode.children]

        switch (true) {
            case isCompatibleBulletLists(prevNode, currNode): {
                mergedNodes.pop()
                mergedNodes.push(new RstBulletList(registrar, mergedSource, mergedChildren))
                break
            }

            case isCompatibleDefinitionLists(prevNode, currNode): {
                mergedNodes.pop()
                mergedNodes.push(new RstDefinitionList(registrar, mergedSource, mergedChildren))
                break
            }

            case isCompatibleFieldLists(prevNode, currNode): {
                mergedNodes.pop()
                mergedNodes.push(new RstFieldList(registrar, mergedSource, mergedChildren))
                break
            }

            case isCompatibleOptionLists(prevNode, currNode): {
                mergedNodes.pop()
                mergedNodes.push(new RstOptionList(registrar, mergedSource, mergedChildren))
                break
            }

            case isCompatibleEnumeratedLists(prevNode, currNode): {
                mergedNodes.pop()
                mergedNodes.push(new RstEnumeratedList(registrar, mergedSource, mergedChildren, prevNode.listType))
                break
            }

            default: {
                mergedNodes.push(currNode)
            }
        }
    }

    return mergedNodes
}

function isCompatibleBulletLists(prevNode: RstNode, currNode: RstNode): boolean {
    return prevNode instanceof RstBulletList && currNode instanceof RstBulletList
}

function isCompatibleDefinitionLists(prevNode: RstNode, currNode: RstNode): boolean {
    return prevNode instanceof RstDefinitionList && currNode instanceof RstDefinitionList
}

function isCompatibleFieldLists(prevNode: RstNode, currNode: RstNode): boolean {
    return prevNode instanceof RstFieldList && currNode instanceof RstFieldList
}

function isCompatibleOptionLists(prevNode: RstNode, currNode: RstNode): boolean {
    return prevNode instanceof RstOptionList && currNode instanceof RstOptionList
}

function isCompatibleEnumeratedLists(prevNode: RstNode, currNode: RstNode): prevNode is RstEnumeratedList {
    if (!(prevNode instanceof RstEnumeratedList)) {
        return false
    }
    if (!(currNode instanceof RstEnumeratedList)) {
        return false
    }
    if (prevNode.listType !== currNode.listType) {
        return false
    }

    const prevListLastBullet = prevNode.children.at(-1)?.children.at(-1)
    const currListFirstBullet = currNode.children.at(0)?.children.at(0)

    if (!(prevListLastBullet instanceof RstBulletListItem)) {
        return false
    }
    if (!(currListFirstBullet instanceof RstBulletListItem)) {
        return false
    }
    if (!isSequentialBullet(prevListLastBullet.bullet, currListFirstBullet.bullet)) {
        return false
    }

    return true
}
