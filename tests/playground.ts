import fs from 'node:fs'
import { RstParser } from '../src/Parser/RstParser.js'

const rst = fs.readFileSync('./tests/data/index.rst').toString('utf-8')
const parser = new RstParser()
const root = parser.parse(rst)
console.log(root.toString())
