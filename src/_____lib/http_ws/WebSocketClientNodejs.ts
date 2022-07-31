import WebSocket from 'ws'
import { safeJSONParse } from '../func/safeJSONParse'

// const pingTimeout = 10 * 1000 //ws10秒超时

export class WebSocketClientNodejs {

    onStatusChange = () => { }

    onRecvStr?: (str: string) => void
    onRecvJSON?: (obj: any) => void
    onRecvBuffer?: (buf: Buffer) => void

    private ws?: WebSocket
    private createWS: () => WebSocket
    private _isConnected = false
    private name: string
    constructor(p: {
        log_tag: string
        url: string
        headers?: { [key: string]: string }
        rejectUnauthorized?: boolean
    }) {
        this.name = p.log_tag

        const options: WebSocket.ClientOptions = {
            rejectUnauthorized: p.rejectUnauthorized,
        }

        if (p.headers !== undefined) {
            options.headers = p.headers
        }

        this.createWS = () => new WebSocket(p.url, options)
        this.connect()
    }

    sendJSON(obj: any) {
        if (this.ws !== undefined && this.isConnected) {
            try {
                this.ws.send(JSON.stringify(obj))
            } catch (error) {

            }
        }
    }

    sendStr(str: string) {
        if (this.ws !== undefined && this.isConnected) {
            try {
                this.ws.send(str)
            } catch (error) {

            }
        }
    }

    sendBuffer(buf: Buffer) {
        if (this.ws !== undefined && this.isConnected) {
            try {
                this.ws.send(buf)
            } catch (error) {

            }
        }
    }
    get isConnected() {
        return this._isConnected
    }

    private connect = () => {
        this.ws = this.createWS()
        console.info(this.name + ' 连接中')
        this.ws.onopen = () => {
            console.info(this.name + ' 连接成功')
            if (this._isConnected === false) {
                this._isConnected = true
                this.onStatusChange()
            }
            // this.pingPong()
        }

        this.ws.onerror = this.ws.onclose = this.reconnect

        this.ws.onmessage = e => {
            if (this.onRecvStr) {
                this.onRecvStr(String(e.data))
            }
            if (this.onRecvJSON) {
                this.onRecvJSON(safeJSONParse(String(e.data)))
            }
            if (this.onRecvBuffer && e.data.constructor === Buffer) {
                this.onRecvBuffer(e.data as Buffer)
            }
        }
    }

    private reconnect = () => {
        console.error(this.name + ' 断开重连')

        //destroy
        if (this.ws !== undefined) {
            this.ws.onopen = this.ws.onerror = this.ws.onclose = this.ws.onmessage = () => { }
            this.ws.removeAllListeners('pong')
            this.ws.close()
            this.ws.terminate()
            this.ws = undefined
        }

        if (this._isConnected) {
            this._isConnected = false
            this.onStatusChange()
        }

        //connect
        setTimeout(this.connect, 5000)
    }


    // private pingPong() {
    //     const { ws } = this
    //     if (ws === undefined) return

    //     let pong = true

    //     ws.addEventListener('pong', () => pong = true)

    //     const f = () => {
    //         if (ws === this.ws) {
    //             if (pong === false) {
    //                 this.reconnect()
    //             } else {
    //                 pong = false
    //                 try {
    //                     ws.ping()
    //                 } catch (error) {

    //                 }
    //                 setTimeout(f, pingTimeout)
    //             }
    //         }
    //     }
    //     f()
    // }
}