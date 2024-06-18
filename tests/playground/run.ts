import { RstCompiler, RstToHtmlCompiler, RstToMdCompiler } from '@/RstCompiler.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const rst = fs.readFileSync(path.join(dirname, 'playground.rst')).toString('utf-8')

console.info('-'.repeat(80))
const html = new RstToHtmlCompiler().compile(rst)
console.info(html.body)
console.info(html.downloads)

console.info('-'.repeat(80))
const md = new RstToMdCompiler().compile(rst)
console.info(md.body)
console.info(md.downloads)

console.info('-'.repeat(80))
const compiler = new RstCompiler()
const parserOutput = compiler.parse(rst)
console.info(parserOutput.root.toString())
