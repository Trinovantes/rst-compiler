declare module '*?worker' {
    declare class CustomWorker extends Worker {
        constructor() {
            //
        }
    }

    export default CustomWorker
}
