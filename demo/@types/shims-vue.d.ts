// Needed to avoid @typescript-eslint/no-unsafe-assignment
declare module '*.vue' {
    import { ComponentOptions } from 'vue'
    const component: ComponentOptions
    export default component
}
