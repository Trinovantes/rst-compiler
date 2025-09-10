import { RstToHtmlCompiler, RstToMdCompiler } from '../../src/RstCompiler.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const rst = fs.readFileSync(path.join(dirname, 'playground.rst')).toString('utf-8')

const htmlCompiler = new RstToHtmlCompiler()
const mdCompiler = new RstToMdCompiler()

console.info('-'.repeat(80))
const parserOutput = htmlCompiler.parse(rst)
console.info(parserOutput.root.toString())

console.info('-'.repeat(80))
const html = htmlCompiler.compile(parserOutput)
console.info(html.body)
console.info(html.downloads)

console.info('-'.repeat(80))
const md = mdCompiler.compile(parserOutput)
console.info(md.body)
console.info(md.downloads)
