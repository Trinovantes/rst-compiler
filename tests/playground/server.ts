import { RstToHtmlCompiler } from '@/RstCompiler.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getHighlighter } from 'shiki'

const port = 8080

Bun.serve({
    port,

    fetch: async() => {
        const filename = fileURLToPath(import.meta.url)
        const dirname = path.dirname(filename)
        const rst = fs.readFileSync(path.join(dirname, 'playground.rst')).toString('utf-8')
        const { body, header } = new RstToHtmlCompiler().compile(rst, {}, {
            defaultSyntaxLanguage: 'python',
            shiki: {
                theme: 'min-dark',
                transformers: [],
                highlighter: await getHighlighter({
                    langs: ['py', 'js', 'cpp', 'csharp'],
                    themes: ['min-dark'],
                }),
            },
        })

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
${header}
</head>
<body>
${body}
</body>
</html>`

        return new Response(html, {
            headers: {
                'content-type': 'text/html',
            },
        })
    },
})

console.info('Server Ready', port)
