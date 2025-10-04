import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeJson, RstNodeObject, RstNodeSource } from '../RstNode.ts'
import { RstText, type RstTextData } from './Text.ts'
import type { RstNodeType } from '../RstNodeType.ts'

export const interpretedTextRoleRe = /[a-zA-Z0-9](?:[a-zA-Z0-9]|[-_+:.]{0,1}[a-zA-Z0-9])*/

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export type RstInterpretedTextData = RstTextData & {
    role: string
}

export class RstInterpretedText extends RstText {
    readonly role: string

    constructor(
        registrar: RstNodeRegistrar,
        source: RstNodeSource,
        rawText: string,
        role: string,
    ) {
        super(registrar, source, rawText)
        this.role = role
    }

    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            role: this.role,
        }

        return root
    }

    override toJSON(): RstNodeJson {
        const root = super.toJSON() as RstNodeJson<RstInterpretedTextData>

        root.data = {
            rawText: this.rawText,
            role: this.role,
        }

        return root
    }

    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstInterpretedTextData>): RstInterpretedText {
        return new RstInterpretedText(registrar, structuredClone(json.source), json.data.rawText, json.data.role)
    }

    override clone(registrar: RstNodeRegistrar): RstInterpretedText {
        return new RstInterpretedText(registrar, structuredClone(this.source), this.rawText, this.role)
    }

    override get nodeType(): RstNodeType {
        return 'InterpretedText'
    }

    override toShortString(): string {
        return `${super.toShortString()} role:"${this.role ?? 'NULL'}"`
    }
}
