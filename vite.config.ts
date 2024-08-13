import path from 'node:path'
import { defineConfig, mergeConfig } from 'vitest/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import dts from 'vite-plugin-dts'

export const commonConfig = defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'tests': path.resolve(__dirname, 'tests'),
        },
    },

    plugins: [
        nodePolyfills(),
    ],
})

export default mergeConfig(commonConfig, defineConfig({
    test: {
        dir: './tests',
        silent: Boolean(process.env.CI),
    },

    build: {
        minify: false,
        sourcemap: true,

        lib: {
            entry: path.resolve(__dirname, './src/index.ts'),
            name: 'RstCompiler',
            fileName: 'index',
        },

        rollupOptions: {
            external: ['katex', 'shiki'],
        },
    },

    plugins: [
        dts({
            insertTypesEntry: true,
            tsconfigPath: path.resolve(__dirname, './tsconfig.prod.json'),
        }),
    ],
}))
