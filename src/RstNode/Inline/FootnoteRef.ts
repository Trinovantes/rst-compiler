import { isSimpleName } from '../../SimpleName.ts'
import type { RstNodeJson, RstNodeObject } from '../RstNode.ts'
import { RstText, type RstTextData } from './Text.ts'
import type { RstNodeRegistrar } from '../../Parser/RstNodeRegistrar.ts'
import type { RstNodeType } from '../RstNodeType.ts'

// ----------------------------------------------------------------------------
// MARK: Node
// ----------------------------------------------------------------------------

export class RstFootnoteRef extends RstText {
    override toObject(): RstNodeObject {
        const root = super.toObject()

        root.data = {
            isManualLabelNum: this.isManualLabelNum,
            isAutoSymbol: this.isAutoSymbol,
        }

        return root
    }

    static override reviveRstNodeFromJson(registrar: RstNodeRegistrar, json: RstNodeJson<RstTextData>): RstFootnoteRef {
        return new RstFootnoteRef(registrar, structuredClone(json.source), json.data.rawText)
    }

    override clone(registrar: RstNodeRegistrar): RstFootnoteRef {
        return new RstFootnoteRef(registrar, structuredClone(this.source), this.rawText)
    }

    override get nodeType(): RstNodeType {
        return 'FootnoteRef'
    }

    get isManualLabelNum(): boolean {
        return /^[1-9]\d*$/.test(this.rawText)
    }

    get isAutoSymbol(): boolean {
        return this.rawText === '*'
    }

    static isValidText(bodyText: string): boolean {
        if (/^[1-9]\d*$/.test(bodyText)) {
            return true
        }

        if (bodyText === '#') {
            return true
        }

        if (bodyText.startsWith('#') && isSimpleName(bodyText.substring(1))) {
            return true
        }

        if (bodyText === '*') {
            return true
        }

        return false
    }
}
