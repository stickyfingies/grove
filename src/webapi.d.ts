/**
 * @see /docs/server.md
 */

export interface IWebAPI {
    onmessage: (endpoint: string, callback: Function) => Promise<void>,
}

declare global {
    interface Window {
        webApi: IWebAPI
    }
}