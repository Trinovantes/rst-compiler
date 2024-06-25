import { RstParagraph } from '@/RstNode/Block/Paragraph.js'
import { RstNodeSource } from '@/RstNode/RstNode.js'
import { describe, expect, test } from 'vitest'
import { RstText } from '@/RstNode/Inline/Text.js'
import { parseTestInput } from 'tests/fixtures/parseTestInput.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'

const registrar = new RstNodeRegistrar()
const source: RstNodeSource = {
    startLineIdx: 0xDEADBEEF,
    endLineIdx: 0xDEADBEEF,
}

// ----------------------------------------------------------------------------
// MARK: Tree Traversal
// ----------------------------------------------------------------------------

describe('isFirstChild', () => {
    test('when node has no parent, it returns true', () => {
        const node = new RstParagraph(registrar, source)
        expect(node.isFirstChild()).toBe(true)
    })

    test('when parent has 1 child, it returns true for only child', () => {
        const child1 = new RstText(registrar, source, '1')
        const parent = new RstParagraph(registrar, source, [
            child1,
        ])

        expect(parent.children.length).toBe(1)
        expect(child1.isFirstChild()).toBe(true)
    })

    test('when parent has multiple children, it returns true for first child', () => {
        const child1 = new RstText(registrar, source, '1')
        const child2 = new RstText(registrar, source, '2')
        const parent = new RstParagraph(registrar, source, [
            child1,
            child2,
        ])

        expect(parent.children.length).toBe(2)
        expect(child1.isFirstChild()).toBe(true)
        expect(child2.isFirstChild()).toBe(false)
    })
})

describe('getPrevSibling', () => {
    test('when node has no parent, it returns null', () => {
        const node = new RstParagraph(registrar, source)
        expect(node.getPrevSibling()).toBe(null)
    })

    test('when parent has multiple children, it returns prev sibling or null if first', () => {
        const child1 = new RstText(registrar, source, '1')
        const child2 = new RstText(registrar, source, '2')
        const parent = new RstParagraph(registrar, source, [
            child1,
            child2,
        ])

        expect(parent.children.length).toBe(2)
        expect(child1.getPrevSibling()).toBe(null)
        expect(child2.getPrevSibling()).toBe(child1)
    })
})

describe('getNextSibling', () => {
    test('when node has no parent, it returns null', () => {
        const node = new RstParagraph(registrar, source)
        expect(node.getNextSibling()).toBe(null)
    })

    test('when parent has multiple children, it returns next sibling or null if last', () => {
        const child1 = new RstText(registrar, source, '1')
        const child2 = new RstText(registrar, source, '2')
        const parent = new RstParagraph(registrar, source, [
            child1,
            child2,
        ])

        expect(parent.children.length).toBe(2)
        expect(child1.getNextSibling()).toBe(child2)
        expect(child2.getNextSibling()).toBe(null)
    })
})

describe('getNextNodeInTree', () => {
    test('when node has next sibling, it returns next sibling', () => {
        const input = `
            v1

                v1.1

                    v1.1.1

                    v1.1.2

                v1.2
        `

        const { root } = parseTestInput(input)
        const v111 = root.findChildWithTextContent('v1.1.1')
        expect(v111?.getNextNodeInTree()?.toString()).toContain('v1.1.2')
    })

    test('when node is last sibling, it returns next sibling of its parent', () => {
        const input = `
            v1

                v1.1

                    v1.1.1

                    v1.1.2

                v1.2
        `

        const { root } = parseTestInput(input)
        const v112 = root.findChildWithTextContent('v1.1.2')
        expect(v112?.getNextNodeInTree()?.toString()).contain('v1.2')
    })

    test('when node is last node of tree, it returns null', () => {
        const input = `
            v1

                v1.1

                    v1.1.1

                    v1.1.2

                v1.2
        `

        const { root } = parseTestInput(input)
        const v12 = root.findChildWithTextContent('v1.2')
        expect(v12?.getNextNodeInTree()).toBe(null)
    })
})

// ----------------------------------------------------------------------------
// MARK: Serialization
// ----------------------------------------------------------------------------

const input = `
# Document

----

paragraph

    blockquote

        * bullet
        * list
        * another
    
    line

    -- end

1. enumerated
2. list
3. hello world

term 3 : classifier
    Definition 3.

term 4 : classifier one : classifier two
    Definition 4.

:Date: 2001-08-16
:Version: 1

-a         Output all.
-c arg     Output just arg.
--long     Output all day long.

::

    for a in [5,4,3,2,1]:   # this is program code, shown as-is
        print a
    print "it's..."
    # a literal block continues until the indentation ends

John Doe wrote::

>> Great idea!
>
> Why didn't I think of that?

| Lend us a couple of bob till Thursday.
| I'm absolutely skint.
| But I'm expecting a postal order and I can pay you back
as soon as it comes.
| Love, Ewan.

>>> print 'this is a Doctest block'
this is a Doctest block

+------------------------+------------+----------+----------+
| Header row, column 1   | Header 2   | Header 3 | Header 4 |
| (header rows optional) |            |          |          |
+========================+============+==========+==========+
| body row 1, column 1   | column 2   | column 3 | column 4 |
+------------------------+------------+----------+----------+
| body row 2             | Cells may span columns.          |
+------------------------+------------+---------------------+
| body row 3             | Cells may  | - Table cells       |
+------------------------+ span rows. | - contain           |
| body row 4             |            | - body elements.    |
+------------------------+------------+---------------------+

=====  =====  =======
  A      B    A and B
=====  =====  =======
False  False  False
True   False  False
False  True   False
True   True   True
=====  =====  =======

Please RTFM [1]_.

.. [1] Body elements go here.

Here is a citation reference: [CIT2002]_.

.. [CIT2002] This is the citation.  It's just like a footnote,
   except the label is textual.

.. _target1:
.. _target2:

The targets "target1" and "target2" are synonyms; they both
point to this paragraph.

.. figure:: larch.png

   The larch.

The |biohazard| symbol must be used on containers used to
dispose of medical waste.

.. |biohazard| image:: biohazard.png

.. This is a comment

This is *emphasized text*.

This is **strong text**.

:role:\`interpreted text\`

This text is an example of \`\`inline literals\`\`.

See the \`Python home page <https://www.python.org>\`_ for info.

This \`link <Python home page_>\`_ is an alias to the link above.

Oh yes, the _\`Norwegian Blue\`.  What's, um, what's wrong with it?

See https://www.python.org.
`

describe('toJSON', () => {
    const { root } = parseTestInput(input)
    const rootClone = new RstNodeRegistrar().reviveRstNodeFromJson(root.toJSON())

    test('node can be converted to json and revived into equivalent node', () => {
        expect(rootClone.toObject()).toStrictEqual(root.toObject())
    })

    test('revived node does not have same object references', () => {
        expect(rootClone.source).not.toBe(root.source)
    })
})

describe('clone', () => {
    const { root } = parseTestInput(input)
    const rootClone = root.clone(new RstNodeRegistrar())

    test('cloned node has equivalent values', () => {
        expect(rootClone.toObject()).toStrictEqual(root.toObject())
    })

    test('cloned node does not have same object references', () => {
        expect(rootClone.source).not.toBe(root.source)
    })
})
