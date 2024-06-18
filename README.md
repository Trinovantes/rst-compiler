# RST Compiler

This is a reStructuredText parser and HTML/Markdown generator implemented in pure TypeScript.

## Basic Usage

``` ts
import fs from 'node:fs'
import { RstToHtmlCompiler } from 'rst-compiler'

const rst = fs.readFileSync('./index.rst').toString('utf-8')
const html = new RstToHtmlCompiler().compile(rst)

console.log(html.header) // Content that should be written to <head>
console.log(html.body) // Main document
```

## Multiple Documents Usage

In order to resolve references that may exist in other documents, the compiler uses two-stage compilation:

```ts
const compiler = new RstToHtmlCompiler()

// 1. The compiler first needs to parse each document into their respective ASTs
//    References are NOT checked at this stage since the compiler does not know what other documents you may have
const doc1ParserOutput = compiler.parse(':doc:`See Document 2 <./foo>`')
const doc2ParserOutput = compiler.parse('Document 2')

// 2. The compiler then reads all the ASTs for your project in order to resolve references and generate HTML
const doc1Html = compiler.generate({
    basePath: '/blog/', // Any links to other documents will be prefixed with this value
    currentDocPath: 'index', // Relative to basePath
    docs: [
        {
            docPath: 'index',
            parserOutput: doc1ParserOutput,
        },
        {
            docPath: 'foo',
            parserOutput: doc2ParserOutput,
        },
    ],
})

console.log(doc1Html.body) // <a href="/blog/foo">See Document 2</a>
```

<!--
===============================================================================
MARK: Limitations
===============================================================================
-->
## Limitations

Since reStructuredText [does not have a formal specification](https://docutils.sourceforge.io/docs/dev/rst/problems.html#formal-specification),
this program's behavior may deviate slightly from the reference implementation in Python's docutils library due to differences in parsing strategies.

* Only spaces can be used for indentation

* Third-party extensions and most directives and interpreted text roles from Sphinx are not available since they are implemented in Python

* It is not recommended to run the compiler on untrusted input as there is no XSS sanitation on the output.
  In addition, the compiler makes extensive use of lookahead and lookbehind regular expressions which may cause ReDoS attacks.

<!--
===============================================================================
MARK: Plugins
===============================================================================
-->
## Plugins

If you wish to add additional functionality, you should should implement either custom Directives (for block-level output) or custom InterpretedTexts (for inline-level output).

```ts
import { RstCompilerPlugin } from 'rst-compiler'

const plugin: RstCompilerPlugin = {
    onInstall: (compiler) => {
        compiler.useDirectiveGenerator({
            directives: [
                'custom-directive',
            ],

            generate: (generatorState, node) => {
                generatorState.visitNodes(node.children)
            },
        })
    },
}

const compiler = new RstToHtmlCompiler()
this.usePlugin(plugin)
```

All of the built-in Directives and InterpretedText in the compiler are implemented as plugins as well.
Please see the [Plugins directory](https://github.com/Trinovantes/rst-compiler/tree/master/src/Plugins) for example code.

<!--
===============================================================================
MARK: InterpretedText
===============================================================================
-->
## InterpretedText Roles Supported

All [standard text roles](https://docutils.sourceforge.io/docs/ref/rst/roles.html) are supported.
In addition, the following text roles from Sphinx are supported:

<!-- ====================================================================== -->
### `:ref:`

See [sphinx](https://www.sphinx-doc.org/en/master/usage/referencing.html#role-ref) for more information.

<!-- ====================================================================== -->
### `:doc:`

See [sphinx](https://www.sphinx-doc.org/en/master/usage/referencing.html#role-doc) for more information.

<!-- ====================================================================== -->
### `:download:`

```rst
See :download:`this example script <example.py>`.
```

```ts
const { downloads } = RstToHtmlCompiler.compile(rst)
console.log(downloads[0])
// {
//     srcPath: '/example.py',
//     destPath: '/_downloads/954c614a01144f97fd09b9c1d1dbc574fc10e6c0/example.py',
// }
```

The output will be an `<a>` that links to the `_downloads` directory.
You will need to serve it with appropriate `Content-Type` headers that allow browsers to download the link.

See [sphinx](https://www.sphinx-doc.org/en/master/usage/referencing.html#role-download) for more information.

<!--
===============================================================================
MARK: Directives
===============================================================================
-->
## Directives Supported

<!-- ====================================================================== -->
### `attention`, `caution`, `danger`, `error`, `hint`, `important`, `note`, `tip`, `warning`, `admonition`

```rst
.. danger::

   Beware killer rabbits!
```

See [docutils](https://docutils.sourceforge.io/docs/ref/rst/directives.html#specific-admonitions) for more information.

<!-- ====================================================================== -->
### `image`, `figure`

```rst
.. image:: picture.png
```

See [docutils](https://docutils.sourceforge.io/docs/ref/rst/directives.html#image) for more information.

<!-- ====================================================================== -->
### `only`

```rst
.. only:: html and draft

    This text will only appear when html and draft fields in RstGeneratorOptions.outputEnv are true
```

```ts
RstToHtmlCompiler.compile(rst, {}, {
    outputEnv: {
        html: true,
        draft: true,
    },
})
```

See [sphinx](https://www.sphinx-doc.org/en/master/usage/restructuredtext/directives.html#directive-only) for more information.

<!-- ====================================================================== -->
### `code`, `highlight` (powered by [Shiki](https://shiki.style/))

```rst
.. code:: python

   def my_function():
       "just a test"
       print(8/2)
```

```ts
import { getHighlighter } from 'shiki'

RstToHtmlCompiler.compile(rst, {}, {
    shiki: {
        defaultLanguage: 'python',
        theme: 'min-dark',
        transformers: [],
        highlighter: await getHighlighter({
            langs: ['py', 'js', 'cpp'],
            themes: ['min-dark'],
        }),
    },
})
```

See [docutils](https://docutils.sourceforge.io/docs/ref/rst/directives.html#code) for more information.

<!-- ====================================================================== -->
### `math` (powered by [KaTeX](https://katex.org/))

```rst
.. math::

    \sin(x) = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{(2n+1)!}
```

```ts
const html = RstToHtmlCompiler.compile(rst)
console.log(html.header) // Will contain <link> to katex's css
```

See [docutils](https://docutils.sourceforge.io/docs/ref/rst/directives.html#math) for more information.

<!-- ====================================================================== -->
### `tabs`, `tab`, `code-tab` (based on [`sphinx-tabs`](https://pypi.org/project/sphinx-tabs/))

```rst
.. tabs::

    .. tab:: Label A

        Text A

    .. tab:: Label B

        Text B
```

```ts
const html = RstToHtmlCompiler.compile(rst)
console.log(html.header) // Will contain <script> needed to make tabs interactive
```

See [sphinx-tabs](https://pypi.org/project/sphinx-tabs/) for more information.

**Note:** If you are using the Markdown output in Vitepress, you will need to install [`vitepress-plugin-tabs`](https://vitepress-plugins.sapphi.red/tabs/)

<!--
===============================================================================
MARK: Dev Notes
===============================================================================
-->
## Dev Notes

Create `./tests/playground/playground.rst` (not tracked by Git) and write test input

* Run `yarn playPy` to run `docutils` (Python reference implementation) on test input

* Run `yarn playJs` to run `rst-compiler` on test input (requires [Bun](https://bun.sh/) runtime)

    * Press `F5` in VSCode to run this command inside the debugger

    * Run `yarn server` to serve the output at [localhost:8080](http://localhost:8080)
