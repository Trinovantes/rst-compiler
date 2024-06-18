/**
 * Assume 1-based counting
 *   1 = *
 *   2 = &dagger;
 *   3 = &Dagger;
 *  10 = &clubs;
 *  11 = ** (repeat 2 times)
 */
export function getAutoFootnoteSymbol(symNum: number): string {
    if (symNum < 1) {
        throw new Error('symNum must be >= 1')
    }

    const charId = (symNum - 1) % 10
    const multiple = Math.floor((symNum - 1) / 10) + 1

    const symbol = (() => {
        switch (charId) {
            case 0: return '*'
            case 1: return '&dagger;'
            case 2: return '&Dagger;'
            case 3: return '&sect;'
            case 4: return '&para;'
            case 5: return '#'
            case 6: return '&spades;'
            case 7: return '&hearts;'
            case 8: return '&diams;'
            case 9: return '&clubs;'
        }

        throw new Error(`Invalid charId:${charId}`)
    })()

    return symbol.repeat(multiple)
}
