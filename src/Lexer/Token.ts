export type Token = {
    idx: number // Position in input string (not line/row idx)
    len: number // Length of current line (excluding newline character)
    str: string
}
