import type { RstParserState } from './RstParserState.js'

export class RstParserError extends Error {
    private _parserState: RstParserState
    private _msg: string

    constructor(
        parserState: RstParserState,
        msg: string,
    ) {
        super(msg)
        this.name = 'RstParserError'
        this._parserState = parserState
        this._msg = msg

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
