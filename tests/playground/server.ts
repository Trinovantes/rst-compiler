import { RstToHtmlCompiler } from '@/RstCompiler.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHighlighter } from 'shiki'

const port = 8080

Bun.serve({
    port,

    fetch: async() => {
        const filename = fileURLToPath(import.meta.url)
        const dirname = path.dirname(filename)
        const rst = fs.readFileSync(path.join(dirname, 'playground.rst')).toString('utf-8')
        const { body, header } = new RstToHtmlCompiler().compile(rst, {}, {
            defaultCodeDirectiveLanguage: 'python',
            shiki: {
                theme: 'github-light',
                highlighter: await createHighlighter({
                    langs: ['python', 'js'],
                    themes: ['github-light'],
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
