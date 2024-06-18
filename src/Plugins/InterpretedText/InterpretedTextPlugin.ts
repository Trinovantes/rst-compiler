import { createRstCompilerPlugins } from '@/RstCompilerPlugin.js'
import { abbreviationInterpretedTextGenerators } from './Generators/Abbreviation.js'
import { acronymInterpretedTextGenerators } from './Generators/Acronym.js'
import { docInterpretedTextGenerators } from './Generators/Doc.js'
import { downloadInterpretedTextGenerators } from './Generators/Download.js'
import { emphasisInterpretedTextGenerators } from './Generators/Emphasis.js'
import { kbdInterpretedTextGenerators } from './Generators/Kbd.js'
import { literalInterpretedTextGenerators } from './Generators/Literal.js'
import { refInterpretedTextGenerators } from './Generators/Ref.js'
import { strongInterpretedTextGenerators } from './Generators/Strong.js'
import { subscriptInterpretedTextGenerators } from './Generators/Subscript.js'
import { superscriptInterpretedTextGenerators } from './Generators/Superscript.js'
import { titleRefInterpretedTextGenerators } from './Generators/TitleRef.js'

export const interpretedTextPlugins = createRstCompilerPlugins({
    interpretedTextGenerators: [
        abbreviationInterpretedTextGenerators,
        acronymInterpretedTextGenerators,
        docInterpretedTextGenerators,
        downloadInterpretedTextGenerators,
        emphasisInterpretedTextGenerators,
        kbdInterpretedTextGenerators,
        literalInterpretedTextGenerators,
        refInterpretedTextGenerators,
        strongInterpretedTextGenerators,
        subscriptInterpretedTextGenerators,
        superscriptInterpretedTextGenerators,
        titleRefInterpretedTextGenerators,
    ],
})
