<script lang="ts" setup>
import { ref } from 'vue'
import CodeEditor from './CodeEditor.vue'
import CodePreview from './CodePreview.vue'
import { useAppEvent } from './useAppEvent.js'
import { getDefaultText } from './getDefaultText.js'
import githubIconPath from '../img/github.svg'
import npmIconPath from '../img/npm.svg'
import { compressToBase64 } from 'lz-string'
import { useQuasar } from 'quasar'

const appEvent = useAppEvent()
const resetText = () => {
    appEvent.emit('resetEditor')
    window.location.hash = ''
}

const $q = useQuasar()
const editorText = ref(getDefaultText())
const copyPermalink = () => {
    const encodedText = compressToBase64(editorText.value)
    window.location.hash = encodedText

    if ('clipboard' in navigator) {
        void navigator.clipboard.writeText(window.location.href)

        $q.notify({
            message: 'Copied to Clipboard',
            type: 'positive',
            position: 'bottom',
        })
    }
}
</script>

<template>
    <div class="app">
        <header>
            <h1>
                rst-compiler
            </h1>

            <q-btn
                label="Reset"
                icon="restart_alt"
                outline
                no-caps
                @click="resetText"
            />

            <q-btn
                label="Copy Permalink"
                icon="content_copy"
                outline
                no-caps
                @click="copyPermalink"
            />

            <div class="space" />

            <q-btn
                round
                flat
                href="https://www.npmjs.com/package/rst-compiler"
                title="Download on NPM"
            >
                <img
                    class="icon"
                    :src="npmIconPath"
                >
            </q-btn>

            <q-btn
                round
                flat
                href="https://github.com/Trinovantes/rst-compiler"
                title="Source Code on GitHub"
            >
                <img
                    class="icon"
                    :src="githubIconPath"
                >
            </q-btn>
        </header>

        <main>
            <CodeEditor
                class="code-editor"
                v-model="editorText"
            />
            <CodePreview
                v-model="editorText"
            />
        </main>
    </div>
</template>

<style lang="scss" scoped>
.app{
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100dvh;

    header{
        border-bottom: 1px solid $border-color;
        grid-column: 1/-1;
        display: flex;
        gap: calc($padding / 2);
        padding: $padding;

        h1{
            align-items: center;
            display: flex;
            font-size: 2rem;
            line-height: 1rem;
            margin-right: calc($padding / 2);
        }

        .space{
            flex: 1;
        }

        .icon{
            display: block;
            object-fit: contain;
            width: 32px;
            height: 32px;
        }
    }

    main{
        container-type: size;
        display: grid;
        grid-template-columns: 1fr 1fr;
        height: 100%;
    }
}
</style>
