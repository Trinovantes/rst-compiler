import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import packageJson from './package.json' with { type: 'json' }
import { fileURLToPath } from 'node:url'

export default defineConfig({
    root: path.resolve(__dirname, './demo'),
    base: '/rst-compiler/',

    build: {
        sourcemap: true,
    },

    server: {
        port: 8080,
    },

    define: {
        'import.meta.env.PROJECT_TITLE': JSON.stringify(packageJson.name),
        'import.meta.env.PROJECT_DESC': JSON.stringify(packageJson.description),
    },

    css: {
        preprocessorOptions: {
            scss: {
                additionalData(source: string, filename: string) {
                    return filename.endsWith('sass')
                        ? `@use "sass:color"\n@use "sass:math"\n@use "${fileURLToPath(new URL('./demo/css/variables.scss', import.meta.url))}" as *\n` + source
                        : `@use "sass:color"; @use "sass:math"; @use "${fileURLToPath(new URL('./demo/css/variables.scss', import.meta.url))}" as *;` + source
                },
            },
        },
    },

    plugins: [
        vue({
            template: {
                transformAssetUrls,
            },
        }),
        quasar(),
    ],
})
