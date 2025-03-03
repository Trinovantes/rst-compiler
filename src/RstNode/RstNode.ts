/* eslint-disable no-use-before-define */

import { RstNodeMap } from './RstNodeMap.js'
import { RstNodeId, RstNodeRegistrar, RstNodeRegistration } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from './RstNodeType.js'

export type RstNodeSource = {
    startLineIdx: number
    endLineIdx: number // exclusive
}

// For diff testing and visual inspection (does not necessarily contain info to reconstruct object)
export type RstNodeObject = {
    type: RstNodeType
    text?: string
    data?: Record<string,
        string | ReadonlyArray<string> |
        number | ReadonlyArray<number> |
        boolean | ReadonlyArray<boolean> |
        RstNodeObject | ReadonlyArray<RstNodeObject> | ReadonlyArray<ReadonlyArray<RstNodeObject>> |
        Record<string, string | undefined> | ReadonlyArray<Record<string, string | undefined>> |
        undefined | null
    >
    children?: Array<RstNodeObject>
}

// For serializing internals to JSON and back
export type RstNodeJson<RstNodeData = unknown> = {
    type: RstNodeType
    data: RstNodeData
    source: RstNodeSource
    children: Array<RstNodeJson>
}

export abstract class RstNode {
    readonly source: Readonly<RstNodeSource>
    readonly children: ReadonlyArray<RstNode>

    private _registration: RstNodeRegistration
    private _parent: RstNode | null = null// Private so nobody else can edit this value but our constructor

    // ------------------------------------------------------------------------
    // MARK: Constructor
    // ------------------------------------------------------------------------

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        children: ReadonlyArray<RstNode> = [],
    ) {
        this.source = source
        this.children = children

        for (const child of this.children) {
            child._parent = this
        }

        this._registration = registrar.registerNewNode(this)
    }

    toObject(): RstNodeObject {
        const root: RstNodeObject = {
            type: this.nodeType,
        }

        if (this.isTextContentBasic) {
            root.text = this.textContent
        } else if (this.children.length > 0) {
            root.children = this.children.map((child) => child.toObject())
        }

        return root
    }

    toJSON(): RstNodeJson {
        return {
            type: this.nodeType,
            data: {},
            source: this.source,
            children: this.children.map((child) => child.toJSON()),
        }
    }

    equals(other: RstNode) {
        return this === other
    }

    abstract clone(registrar: RstNodeRegistrar): RstNode

    abstract get nodeType(): RstNodeType

    get parent(): RstNode | null {
        return this._parent
    }

    get id(): RstNodeId {
        return this._registration.id
    }

    get nthOfType(): number {
        return this._registration.nthOfType
    }

    // ------------------------------------------------------------------------
    // MARK: Data
    // ------------------------------------------------------------------------

    get isInlineNode(): boolean {
        return false
    }

    get willRenderVisibleContent(): boolean {
        return true
    }

    /**
     * When exporting node with toObject, if this function returns true, then the node will simply be
     *  {
     *      type: TYPE,
     *      text: 'textContent',
     *  }
     */
    get isTextContentBasic(): boolean {
        return this.children.length === 1 && (
            (this.children[0].nodeType === 'Text') ||
            (this.children[0].nodeType === 'Paragraph' && this.children[0].isTextContentBasic)
        )
    }

    get textContent(): string {
        let str = ''

        for (const child of this.children) {
            str += child.textContent
        }

        return str
    }

    get rawTextContent(): string {
        let str = ''

        for (const child of this.children) {
            str += child.rawTextContent
        }

        return str
    }

    protected get lineNums(): string {
        const start = this.source.startLineIdx + 1 // Prints line numbers in 1-based counting for ease of reading
        const end = this.source.endLineIdx // Do not +1 so this is inclusive
        const lineNums = (start === end)
            ? `${start}`
            : `${start}-${end}`

        return `line:${lineNums}`
    }

    toShortString(): string {
        return `${this.nodeType} id:${this.id} children:${this.children.length}`
    }

    toString(depth = 0): string {
        const selfTab = '  '.repeat(depth)
        const childTab = '  '.repeat(depth + 1)

        let str = selfTab + `[${this.toShortString()}] (${this.lineNums})\n`

        if (this.isTextContentBasic) {
            for (const line of this.textContent.split('\n')) {
                str += childTab + `"${line}"\n`
            }
        } else {
            for (const child of this.children) {
                str += child.toString(depth + 1)
            }
        }

        return str
    }

    // ------------------------------------------------------------------------
    // MARK: Tree Traversal
    // ------------------------------------------------------------------------

    getParent<T extends keyof RstNodeMap>(expectedParentType: T): RstNodeMap[T] | null {
        if (!this._parent) {
            return null
        }

        if (this._parent.nodeType !== expectedParentType) {
            return null
        }

        return this._parent as RstNodeMap[T]
    }

    isFirstChild(): boolean {
        if (!this._parent) {
            return true
        }

        return this._parent.children.at(0) === this
    }

    getMyIndexInParent(): number | null {
        const idx = this._parent?.children.findIndex((child) => child === this)
        if (idx === undefined || idx < 0) {
            return null
        }

        return idx
    }

    getPrevSibling(): RstNode | null {
        if (!this._parent) {
            return null
        }

        let prev: RstNode | null = null
        for (const child of this._parent.children) {
            if (child === this) {
                return prev
            }

            prev = child
        }

        return null
    }

    getNextSibling(): RstNode | null {
        if (!this._parent) {
            return null
        }

        let prev: RstNode | null = null
        for (const child of this._parent.children) {
            if (prev === this) {
                return child
            }

            prev = child
        }

        return null
    }

    getNextNodeInTree(): RstNode | null {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let currNode: RstNode | null = this
        let nextSibling: RstNode | null = null

        while (currNode !== null) {
            nextSibling = currNode.getNextSibling()
            if (nextSibling) {
                return nextSibling
            }

            currNode = currNode._parent
        }

        return null
    }

    hasChild(pred: (child: RstNode) => boolean): boolean {
        let res = false

        for (const child of this.children) {
            res ||= pred(child) || child.hasChild(pred)

            // Early return
            if (res) {
                return true
            }
        }

        return res
    }

    findChildWithTextContent(needle: string): RstNode | null {
        if (this.textContent === needle) {
            return this
        }

        for (const child of this.children) {
            const res = child.findChildWithTextContent(needle)
            if (res) {
                return res
            }
        }

        return null
    }

    findFirstChild<T extends keyof RstNodeMap>(targetNodeType: T): RstNodeMap[T] | null {
        for (const child of this.children) {
            if (child.nodeType === targetNodeType) {
                return child as RstNodeMap[T]
            }

            const grandChild = child.findFirstChild(targetNodeType)
            if (grandChild) {
                return grandChild
            }
        }

        return null
    }

    findAllChildren<T extends keyof RstNodeMap>(targetNodeType: T): ReadonlyArray<RstNodeMap[T]> {
        const foundNodes = new Array<RstNode>()
        const dfs = (node: RstNode) => {
            if (node.nodeType === targetNodeType) {
                foundNodes.push(node)
            }

            for (const child of node.children) {
                dfs(child)
            }
        }

        dfs(this)
        return foundNodes as unknown as Array<RstNodeMap[T]>
    }
}
