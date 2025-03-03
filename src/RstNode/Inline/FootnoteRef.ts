import { isSimpleName } from '@/SimpleName.js'
import { RstNodeJson, RstNodeObject } from '../RstNode.js'
import { RstText, RstTextData } from './Text.js'
import { createNodeGenerators } from '@/Generator/RstGenerator.js'
import { RstNodeRegistrar } from '@/Parser/RstNodeRegistrar.js'
import { RstNodeType } from '../RstNodeType.js'

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

// ----------------------------------------------------------------------------
// MARK: Generator
// ----------------------------------------------------------------------------

export const footnoteRefGenerators = createNodeGenerators(
    'FootnoteRef',

    (generatorState, node) => {
        const targetDef = generatorState.resolveFootnoteDef(node)
        const targetDefUrl = generatorState.resolveNodeToUrl(targetDef)
        const refId = generatorState.htmlAttrResolver.getNodeHtmlId(node)
        const refLabel = generatorState.resolveFootnoteRefLabel(node)
        generatorState.writeTextWithLinePrefix(`<a href="${targetDefUrl}" id="${refId}" class="${generatorState.opts.htmlClass.footnoteRef}">${refLabel}</a>`)
    },

    (generatorState, node) => {
        const refLabel = generatorState.resolveFootnoteRefLabel(node)
        generatorState.writeTextWithLinePrefix(`[^${refLabel}]`)
    },
)
