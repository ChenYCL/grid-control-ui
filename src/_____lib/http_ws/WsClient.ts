interface WsClient {
    onOpen(f: () => void): void
    onClose(f: (type: 'close' | 'error' | 'timeout', msg: any) => void): void
    onRecv(f: (data: string | ArrayBuffer) => void): void
    send(data: string | ArrayBuffer): void
}