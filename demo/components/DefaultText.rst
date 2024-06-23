====
rst-compiler
====

This is a reStructuredText parser and HTML/Markdown generator implemented in pure TypeScript.

You can install it with :code:`yarn` using this command:

.. code-block::

    yarn add rst-compiler

You can find more information and the source code on GitHub__.

__ https://github.com/Trinovantes/rst-compiler

----
More Examples
----

Paragraphs are separated
by a blank line.

    I will set the seas ablaze

    -- Firefly

Math Equations
+++

.. container:: my-custom-class

    .. math::

        \sin(x) = \sum_{n=0}^{\infty} \frac{(-1)^n}{(2n+1)!} x^{2n+1}

.. container:: my-custom-class

    .. math::

        \cos(x) = \sum_{n=0}^{\infty} \frac{(-1)^n}{(2n)!} x^{2n}

Numbered list:
+++

1. lather
2. rinse
3. repeat

Nested lists:
+++

1. Fruits

   * Apple
   * Banana

2. Vegetables

   * Carrot
   * Broccoli

Grid Table
+++

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
