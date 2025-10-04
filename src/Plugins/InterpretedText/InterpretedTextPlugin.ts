import { createRstCompilerPlugins } from '../../RstCompilerPlugin.ts'
import { abbreviationInterpretedTextGenerators } from './Generators/Abbreviation.ts'
import { acronymInterpretedTextGenerators } from './Generators/Acronym.ts'
import { docInterpretedTextGenerators } from './Generators/Doc.ts'
import { downloadInterpretedTextGenerators } from './Generators/Download.ts'
import { emphasisInterpretedTextGenerators } from './Generators/Emphasis.ts'
import { kbdInterpretedTextGenerators } from './Generators/Kbd.ts'
import { literalInterpretedTextGenerators } from './Generators/Literal.ts'
import { refInterpretedTextGenerators } from './Generators/Ref.ts'
import { strongInterpretedTextGenerators } from './Generators/Strong.ts'
import { subscriptInterpretedTextGenerators } from './Generators/Subscript.ts'
import { superscriptInterpretedTextGenerators } from './Generators/Superscript.ts'
import { titleRefInterpretedTextGenerators } from './Generators/TitleRef.ts'

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
