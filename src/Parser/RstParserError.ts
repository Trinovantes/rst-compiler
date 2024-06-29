import { RstParserState } from './RstParserState.js'

export class RstParserError extends Error {
    constructor(
        private _parserState: RstParserState,
        private _msg: string,
    ) {
        super(_msg)
        this.name = 'RstParserError'

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RstParserError)
        }
    }

    toJSON(): unknown {
        return {
            name: this.name,
            stack: this.stack,
            msg: this._msg,
        }
    }

    override toString(): string {
        let str = `${this.name}: ${this._msg}`
        str += `\n  line:${this._parserState.lineIdx}`
        return str
    }
}
