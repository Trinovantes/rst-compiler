import { RstSection } from '../../RstNode/Block/Section.js'
import { RstDirective } from '../../RstNode/ExplicitMarkup/Directive.js'
import { RstNode } from '../../RstNode/RstNode.js'

export type TocTree = {
    section: RstSection
    children: Array<TocTree>
}

// ----------------------------------------------------------------------------
// MARK: Local TOC
// ----------------------------------------------------------------------------

export function generateLocalToc(node: RstDirective, maxLevel: number): Array<TocTree> {
    const prevSection = findPrevSection(node)
    const localLevel = prevSection?.level
    const sections = findSubSections(node, localLevel)
    return groupSectionsToTocTree(sections.filter((section) => section.level <= maxLevel))
}

// ----------------------------------------------------------------------------
// MARK: Global TOC
// ----------------------------------------------------------------------------

export function generateGlobalToc(node: RstDirective, maxLevel: number): Array<TocTree> {
    const root = node.getRoot()
    const sections = root.findAllChildren('Section')
    return groupSectionsToTocTree(sections.filter((section) => section.level <= maxLevel))
}

// ----------------------------------------------------------------------------
// MARK: Helpers
// ----------------------------------------------------------------------------

function findPrevSection(node: RstNode): RstSection | null {
    let currNode: RstNode | null = node

    while (true) {
        if (!currNode) {
            return null
        }
        if (currNode.nodeType === 'Section') {
            return currNode as RstSection
        }

        currNode = currNode?.getPrevNodeInTree() ?? null
    }
}

function findSubSections(node: RstNode, localLevel?: number): Array<RstSection> {
    const foundNodes = new Array<RstSection>()

    let currNode: RstNode | null = node
    while (currNode) {
        if (currNode.nodeType === 'Section') {
            const section = currNode as RstSection

            // Stop searching for more when we find a RstSection equal level to our local RstSection
            if (localLevel !== undefined && section.level <= localLevel) {
                break
            }

            foundNodes.push(section)
        }

        currNode = currNode.getNextNodeInTree()
    }

    return foundNodes
}

function groupSectionsToTocTree(sections: ReadonlyArray<RstSection>): Array<TocTree> {
    if (sections.length === 0) {
        return []
    }
    if (sections.length === 1) {
        return [
            {
                section: sections[0],
                children: [],
            },
        ]
    }

    const trees = new Array<TocTree>()

    let idx = 0
    while (idx < sections.length) {
        const currIdx = idx
        const currLevel = sections[idx].level
        idx += 1

        // Advance to next RstSection with equal/lower level than current
        while (idx < sections.length && sections[idx].level > currLevel) {
            idx += 1
        }

        trees.push({
            section: sections[currIdx],
            children: groupSectionsToTocTree(sections.slice(currIdx + 1, idx)),
        })
    }

    return trees
}
