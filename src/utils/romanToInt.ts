export const romanUpperRe = /(I+|[MDCLXVI]{2,})/
export const romanLowerRe = /(i+|[mdclxvi]{2,})/

// LOL leetcode actually applicable to work fr fr
export function romanToInt(s: string): number {
    s = s.toUpperCase()
    let sum = 0

    for (let i = 0; i < s.length; i++) {
        const curr = s[i]
        const next = s[i + 1]

        if (curr === 'V') {
            sum += 5
        } else if (curr === 'L') {
            sum += 50
        } else if (curr === 'D') {
            sum += 500
        } else if (curr === 'M') {
            sum += 1000
        } else if (curr === 'I') {
            if (next === 'V' || next === 'X') {
                sum -= 1
            } else {
                sum += 1
            }
        } else if (curr === 'X') {
            if (next === 'L' || next === 'C') {
                sum -= 10
            } else {
                sum += 10
            }
        } else if (curr === 'C') {
            if (next === 'D' || next === 'M') {
                sum -= 100
            } else {
                sum += 100
            }
        }
    }

    return sum
}
