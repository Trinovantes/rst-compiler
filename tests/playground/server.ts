import { RstToHtmlCompiler } from '../../src/RstCompiler.ts'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHighlighter } from 'shiki'
import http from 'node:http'

const highlighter =  await createHighlighter({
    langs: ['python', 'js'],
    themes: ['github-light'],
})

const server = http.createServer((req, res) => {
    try {
        const filename = fileURLToPath(import.meta.url)
        const dirname = path.dirname(filename)
        const rst = fs.readFileSync(path.join(dirname, 'playground.rst'), 'utf-8')
        const { body, header } = new RstToHtmlCompiler().compile(rst, {}, {
            defaultCodeDirectiveLanguage: 'python',
            shiki: {
                theme: 'github-light',
                highlighter: highlighter,
            },
        })

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
${header}
</head>
<body>
${body}
</body>
</html>`

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)
    } catch (err) {
        console.error(err)
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error')
    }
})

const port = 8080
server.listen(port, () => {
    console.info('Server Ready', port)
})
