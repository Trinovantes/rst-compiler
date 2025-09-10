export function createBooleanTable(numRows: number, numCols: number): Array<Array<boolean>> {
    const ret = new Array<Array<boolean>>()

    for (let i = 0; i < numRows - 1; i++) {
        ret.push(new Array<boolean>())

        for (let j = 0; j < numCols - 1; j++) {
            ret[i][j] = false
        }
    }

    return ret
}
