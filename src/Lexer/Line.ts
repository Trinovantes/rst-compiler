/**
 * Unlike a normal compiler where we tokenize the input by all whitespace, we split RST by newlines
 * Thus each "token" in our compiler is simply just a "Line"
 */
export type Line = {
    idx: number // Position in input string (not line/row idx)
    len: number // Length of current line (excluding newline character)
    str: string
}
