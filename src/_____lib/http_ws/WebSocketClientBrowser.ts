import { safeJSONParse } from "../func/safeJSONParse"

export class WebSocketClientBrowser {

    onStatusChange = () => { }
    onRecvStr?: (str: string) => void
    onRecvJSON?: (obj: any) => void
    onRecvBuffer?: (buf: ArrayBuffer) => void

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
        this.createWS = () => new WebSocket(p.url)
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
    get isConnected() {
        return this._isConnected
    }

    private connect = () => {
        this.ws = this.createWS()
        // this.ws.binaryType = 'arraybuffer'
        console.info(this.name + ' 连接中')
        this.ws.onopen = () => {
            console.info(this.name + ' 连接成功')
            if (this._isConnected === false) {
                this._isConnected = true
                this.onStatusChange()
            }
        }

        this.ws.onerror = this.ws.onclose = this.reconnect

        this.ws.onmessage = e => {
            if (this.onRecvStr) {
                this.onRecvStr(String(e.data))
            }
            if (this.onRecvJSON) {
                this.onRecvJSON(safeJSONParse(String(e.data)))
            }
            if (this.onRecvBuffer && e.data.constructor === ArrayBuffer) {
                this.onRecvBuffer(e.data)
            }
        }
    }

    private reconnect = () => {
        console.error(this.name + ' 断开重连')

        //destroy
        if (this.ws !== undefined) {
            this.ws.onopen = this.ws.onerror = this.ws.onclose = this.ws.onmessage = () => { }
            this.ws.close()
            this.ws = undefined
        }

        if (this._isConnected) {
            this._isConnected = false
            this.onStatusChange()
        }

        //connect
        setTimeout(this.connect, 5000)
    }
}
