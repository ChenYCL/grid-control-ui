import { WebSocketClientBrowser } from "./WebSocketClientBrowser"
import type { WebSocketClientNodejs } from './WebSocketClientNodejs'

export const WebSocketClientNew = (p: {
    log_tag: string
    url: string
    headers?: { [key: string]: string }
    rejectUnauthorized?: boolean
}) => {
    if (typeof window === 'undefined') {
        return new (require('./WebSocketClientNodejs')).WebSocketClientNodejs(p) as WebSocketClientNodejs
    } else {
        return new WebSocketClientBrowser(p)
    }
}