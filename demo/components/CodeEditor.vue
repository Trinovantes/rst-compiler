<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'
import { initMonaco } from './initMonaco.js'
import { getDefaultText } from './getDefaultText.js'
import { useAppEvent } from './useAppEvent.js'
import debounce from 'lodash.debounce'

let editor: monaco.editor.IStandaloneCodeEditor | null = null
const editorText = defineModel<string>({ required: true })
const onEditorTextChange = debounce(() => {
    editorText.value = editor?.getValue() ?? ''
}, 1000)

const appEvent = useAppEvent()
appEvent.on('resetEditor', () => {
    editor?.setValue(getDefaultText(false))
})

const codeEditorRef = ref<HTMLDivElement | null>(null)
onMounted(() => {
    if (!codeEditorRef.value) {
        throw new Error('Failed to resolve codeEditorRef')
    }

    initMonaco()

    editor = monaco.editor.create(codeEditorRef.value, {
        value: editorText.value,
        language: 'restructuredtext',
        theme: 'vs-light',
        scrollBeyondLastLine: false,
        minimap: {
            enabled: false,
        },
    })

    editor.onDidChangeModelContent(onEditorTextChange)
})
</script>

<template>
    <div
        class="code-editor"
        ref="codeEditorRef"
    />
</template>

<style lang="scss" scoped>
.code-editor{
    border-right: 1px solid $border-color;
}
</style>
