import { RealDB } from './RealDB'
import WebSocket from 'ws'
import { toType } from '../func/toType'
import { safeJSONParse } from '../func/safeJSONParse'
import { safeFS } from '../nodejs_lib/safeFS'
import { getRootPath } from '../../getRootPath'

const 发送间隔ms = 500


class WsExt {
    private sendFirst = false

    constructor(private ws: WebSocket) {

    }

    send(firstBuffer: string, diffBuffer?: string) {
        if (this.sendFirst === false) {
            this.sendFirst = true
            this.ws.send(firstBuffer)
        }
        if (diffBuffer) {
            this.ws.send(diffBuffer)
        }
    }
}


export class RealDBSyncServer<T, FuncList extends { [funcName: string]: any }> {

    func: { [P in keyof FuncList]?: (req: FuncList[P]) => void } = Object.create(null)
    funcList: FuncList
    realDB: RealDB<T>

    private wss: WebSocket.Server
    private online = new Map<WsExt, true>()

    getOnlineSize() {
        return this.online.size
    }


    private statePath: string

    private state保存 = () => {
        if (this.realDB.需要保存) {
            this.realDB.需要保存 = false
            safeFS.writeJSONFile(this.statePath, (this.realDB.mutableData as any).state)
            console.log('state保存')
        }
    }

    private state读取 = () => {
        if ((this.realDB.mutableData as any).state !== undefined) {
            const obj = safeFS.readJSONFile(this.statePath)
            if (obj !== undefined) {
                this.realDB.__(v => (v as any).state).set(obj)
            }
            console.log('state读取')
            this.realDB.需要保存 = false
        }
    }


    constructor(p: {
        realDB: RealDB<T>
        funcList: FuncList
        path: string
        port: number
    }) {
        this.realDB = p.realDB
        this.funcList = p.funcList

        this.statePath = `${getRootPath()}/db/${p.port}.json`
        this.state读取()

        setInterval(() => {
            const { allBuf, diffBuffer } = this.realDB.getBuffer()
            if (this.online.size > 0) {
                this.online.forEach((_, cc) => {
                    cc.send(allBuf, diffBuffer)
                })
            }
        }, 发送间隔ms)

        this.wss = new WebSocket.Server({ port: p.port })
        this.wss.on('connection', (ws, req) => {
            const wsExt = new WsExt(ws as any)
            this.online.set(wsExt, true)
            console.log(`online +1 --> ${this.online.size}`)
            this.state保存()

            ws.onmessage = d => {
                if (p.path === req.url) {
                    try {
                        const [funcName, funcParam] = safeJSONParse(String(d.data))
                        const f = this.func[funcName]
                        if (f !== undefined) {
                            const req = toType(this.funcList[funcName])(funcParam)
                            f(req)
                        }
                    } catch (e) {
                        console.error('f error ', e)
                    }
                }
            }

            ws.onerror = ws.onclose = () => {
                this.online.delete(wsExt)
                console.log(`online -1 --> ${this.online.size}`)
                this.state保存()
            }
        })
    }
}