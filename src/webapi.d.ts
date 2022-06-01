export interface IWebAPI {
    onmessage: (callback: Function) => Promise<void>,
}

declare global {
    interface Window {
        webApi: IWebAPI
    }
}