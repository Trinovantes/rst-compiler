import { defineConfig, mergeConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { commonConfig } from './vite.config.js'
import packageJson from './package.json'

export default mergeConfig(commonConfig, defineConfig({
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

    plugins: [
        vue({
            template: {
                transformAssetUrls,
            },
        }),
        quasar({
            sassVariables: './demo/css/variables.scss',
        }),
    ],
}))
