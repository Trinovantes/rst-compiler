import { fileURLToPath } from 'node:url'
import { registerHooks } from 'node:module'
import devalue from '@nuxt/devalue'
import { readFileSync } from 'node:fs'

registerHooks({
    load: (url, context, defaultLoad) => {
        if (!url.endsWith('?raw')) {
            return defaultLoad(url, context)
        }

        const filePathLen = url.length - '?raw'.length
        const filePath = fileURLToPath(url.substring(0, filePathLen))
        const source = readFileSync(filePath, 'utf8')

        return {
            format: 'module',
            source: `export default ${devalue(source)}`,
            shortCircuit: true,
        }
    },
})
