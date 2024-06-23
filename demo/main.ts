import './css/main.scss'
import { createApp } from 'vue'
import App from './components/App.vue'
import { Quasar, Notify } from 'quasar'
import { appEventPlugin } from './components/useAppEvent.js'

function main() {
    const app = createApp(App)

    app.use(appEventPlugin)
    app.use(Quasar, {
        plugins: {
            Notify,
        },
    })

    app.mount('#app')
}

main()
