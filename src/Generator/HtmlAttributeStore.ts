type ListAttrKey = 'value' | 'type'
type TableAttrKey = 'rowspan' | 'colspan'
type VideoAttrKey = 'muted' | 'controls' | 'autoplay' | 'loop' | 'preload' | 'src' | 'type'
type ImageAttrKey = 'src' | 'alt' | 'width' | 'height' | 'loading'

type AttrKey = 'id' | 'class' | 'style' | `data-${string}` | 'role' | 'slot' | ListAttrKey | TableAttrKey | VideoAttrKey | ImageAttrKey

export class HtmlAttributeStore {
    private readonly _store = new Map<string, Array<string>>()

    constructor(initValues: Partial<Record<AttrKey, string>> = {}) {
        for (const [key, value] of Object.entries(initValues)) {
            this.set(key as AttrKey, value)
        }
    }

    has(key: AttrKey): boolean {
        return this._store.has(key)
    }

    set(key: AttrKey, value?: string): void {
        if (!value) {
            return
        }

        this._store.set(key, [value])
    }

    get(key: AttrKey): string {
        return (this._store.get(key) ?? []).join(' ').trim()
    }

    append(key: AttrKey, value?: string): void {
        if (!value) {
            return
        }

        let storedValues = this._store.get(key)

        if (!storedValues) {
            storedValues = []
            this._store.set(key, storedValues)
        }

        storedValues.push(value)
    }

    appendAll(key: AttrKey, values: Array<string>): void {
        let storedValues = this._store.get(key)

        if (!storedValues) {
            storedValues = []
            this._store.set(key, storedValues)
        }

        for (const value of values) {
            storedValues.push(value)
        }
    }

    toString(): string {
        if (this._store.size === 0) {
            return ''
        }

        const attrStr = [...this._store.entries()]
            .sort((a, b) => {
                // Put 'id' and 'src' attr at the front
                if (a[0] === 'src') {
                    return -1
                } else if (b[0] === 'src') {
                    return 1
                }

                if (a[0] === 'id') {
                    return -1
                } else if (b[0] === 'id') {
                    return 1
                }

                return a[0].localeCompare(b[0])
            })
            .map(([key, values]) => `${key}="${values.join(' ').trim()}"`)
            .join(' ')

        return ' ' + attrStr // Add leading space so that it can be appended after html tag name e.g. <img${HtmlAttributeStore.toString()}>
    }
}
