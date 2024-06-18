const leftRotate = (val: number, bits: number) => (val << bits) | (val >>> (32 - bits))

const initH0 = 0x67452301
const initH1 = 0xefcdab89
const initH2 = 0x98badcfe
const initH3 = 0x10325476
const initH4 = 0xc3d2e1f0

export function sha1(input: string): string {
    const inputBuffer = new TextEncoder().encode(input)
    if (inputBuffer.byteLength > Number.MAX_SAFE_INTEGER) {
        throw new Error('Input too long')
    }

    const inputLenBits = inputBuffer.byteLength * 8
    const bufferSizeBits = ((inputLenBits + 8) % 512) > 448 // Must be able to fit 1-byte + 64-bit number
        ? inputLenBits + (512 - (inputLenBits % 512)) + 512
        : inputLenBits + (512 - (inputLenBits % 512))

    const bufferSizeBytes = bufferSizeBits / 8

    const buffer = new Uint8Array(bufferSizeBytes)
    buffer.set(inputBuffer)
    buffer.set([0x80], inputBuffer.byteLength)
    buffer.set(convertNumToUint8Array(inputLenBits), bufferSizeBytes - 8)

    let h0 = initH0 | 0
    let h1 = initH1 | 0
    let h2 = initH2 | 0
    let h3 = initH3 | 0
    let h4 = initH4 | 0

    // Each chunk is 512-bits (64 bytes)
    for (let chunkOffsetBytes = 0; chunkOffsetBytes < bufferSizeBytes; chunkOffsetBytes += 64) {
        const w = new Array<number>(80)

        for (let i = 0; i < 16; i++) {
            const valBigEndian =
                buffer[chunkOffsetBytes + (i * 4) + 0] << (24 - 0 * 8) |
                buffer[chunkOffsetBytes + (i * 4) + 1] << (24 - 1 * 8) |
                buffer[chunkOffsetBytes + (i * 4) + 2] << (24 - 2 * 8) |
                buffer[chunkOffsetBytes + (i * 4) + 3] << (24 - 3 * 8)

            w[i] = valBigEndian
        }

        for (let i = 16; i < 80; i++) {
            w[i] = leftRotate(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1)
        }

        let a = h0 | 0
        let b = h1 | 0
        let c = h2 | 0
        let d = h3 | 0
        let e = h4 | 0

        for (let i = 0; i < 80; i++) {
            let f: number
            let k: number

            if (0 <= i && i < 20) {
                f = (b & c) | (~b & d)
                k = 0x5A827999
            } else if (20 <= i && i < 40) {
                f = b ^ c ^ d
                k = 0x6ED9EBA1
            } else if (40 <= i && i < 60) {
                f = (b & c) | (b & d) | (c & d)
                k = 0x8F1BBCDC
            } else /* if (60 <= i && i < 80) */ {
                f = b ^ c ^ d
                k = 0xCA62C1D6
            }

            const temp = leftRotate(a, 5) + f + e + k + w[i]
            e = d
            d = c
            c = leftRotate(b, 30)
            b = a
            a = temp
        }

        h0 = (h0 + a) | 0
        h1 = (h1 + b) | 0
        h2 = (h2 + c) | 0
        h3 = (h3 + d) | 0
        h4 = (h4 + e) | 0
    }

    const outputBuffer = Buffer.alloc(20)
    outputBuffer.writeInt32BE(h0, 0)
    outputBuffer.writeInt32BE(h1, 4)
    outputBuffer.writeInt32BE(h2, 8)
    outputBuffer.writeInt32BE(h3, 12)
    outputBuffer.writeInt32BE(h4, 16)

    return outputBuffer.toString('hex')
}

export function convertNumToUint8Array(val: number): Uint8Array {
    const buffer = new ArrayBuffer(8)
    const dataView = new DataView(buffer)

    const low = val | 0 // Get lower 32 bits
    const high = (val - low) / Math.pow(2, 32)

    dataView.setUint32(4, low, false)
    dataView.setUint32(0, high, false)

    return new Uint8Array(buffer)
}

export function printUint8Array(buffer: Uint8Array): void {
    for (let i = 0; i < buffer.length; i += 8) {
        let str = ''

        for (let j = 0; j < 8; j += 1) {
            str += ' ' + buffer.at(i + j)?.toString(16).padStart(2, '0')
        }

        console.info(str)
    }

    console.info(buffer.length * 8)
}
