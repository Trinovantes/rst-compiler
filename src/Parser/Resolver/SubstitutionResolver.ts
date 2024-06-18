import { RstGeneratorError } from '@/Generator/RstGeneratorError.js'
import { RstGeneratorState } from '@/Generator/RstGeneratorState.js'
import { RstSubstitutionDef } from '@/RstNode/ExplicitMarkup/SubstitutionDef.js'
import { RstSubstitutionRef } from '@/RstNode/Inline/SubstitutionRef.js'

export class SubstitutionResolver {
    private readonly _substitutionDefs: ReadonlyMap<string, RstSubstitutionDef>
    private readonly _substitutionDefsBackup: ReadonlyMap<string, RstSubstitutionDef>

    constructor(
        substitutionDefs: ReadonlyArray<RstSubstitutionDef>,
    ) {
        this._substitutionDefs = new Map(substitutionDefs.map((def) => [def.needle, def]))
        this._substitutionDefsBackup = new Map(substitutionDefs.map((def) => [def.needle.toLowerCase(), def]))
    }

    resolveSubstitution(generatorState: RstGeneratorState, substitutionRef: RstSubstitutionRef): RstSubstitutionDef {
        const def = this._substitutionDefs.get(substitutionRef.textContent) ?? this._substitutionDefsBackup.get(substitutionRef.textContent)
        if (!def) {
            throw new RstGeneratorError(generatorState, substitutionRef, 'Failed to resolveSubstitution')
        }

        return def
    }
}
