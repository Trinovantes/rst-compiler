import { defineConfig, mergeConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { commonConfig } from './vite.config.js'

export default mergeConfig(commonConfig, defineConfig({
    root: path.resolve(__dirname, './demo'),
    base: 'rst-compiler',

    server: {
        port: 8080,
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
