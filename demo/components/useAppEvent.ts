import mitt, { type Emitter } from 'mitt'
import { type Plugin, inject } from 'vue'

type AppEvent = {
    resetEditor: void
}

const APP_EVENT_EMITTER_KEY = Symbol('AppEvent')

export function useAppEvent(): Emitter<AppEvent> {
    return inject(APP_EVENT_EMITTER_KEY) as Emitter<AppEvent>
}

export const appEventPlugin: Plugin = {
    install(app) {
        app.provide(APP_EVENT_EMITTER_KEY, mitt<AppEvent>())
    },
}
