import { mapObjIndexed } from "ramda" 
import { SubPub } from "../func/SubPub"
import { toType } from "../func/toType"
import { WebSocketClientNew } from "../http_ws/WebSocketClient"
import { RealDB, OP } from "./RealDB"

export class RealDBSyncClient<T, FuncList extends { [funcName: string]: any }>{

    realDB: RealDB<T>

    func: { [P in keyof FuncList]: (req: FuncList[P]) => void }

    private ws: ReturnType<typeof WebSocketClientNew>

    private 收到了消息 = false

    constructor(p: {
        url: string
        realDB: RealDB<T>,
        funcList: FuncList
    }) {
        this.realDB = p.realDB
        this.func = mapObjIndexed(
            (req, funcName) => (p: any) => {
                if (this.ws.isConnected) {
                    //toType 不发多余字段
                    this.ws.sendJSON([funcName, toType(req)(p)])
                }
            },
            p.funcList,
        ) as any

        this.ws = WebSocketClientNew({
            log_tag: 'WSSync.Client',
            url: p.url,
        })

        this.ws.onStatusChange = () => {
            this.收到了消息 = false
            this.onStatusChange.publish()
        }

        this.ws.onRecvStr = str => {
            if (this.收到了消息 === false) {
                this.收到了消息 = true
                this.realDB.setFirstBuffer(str)
            } else {
                const arr = this.realDB.setDiffBuffer(str)
                arr.forEach(v => this.onOP.publish(v))
            }
            this.onData.publish()
        }
    }

    onOP = new SubPub<OP>()
    onData = new SubPub<void>()
    onStatusChange = new SubPub<void>()

    get isConnected_and_收到了消息() {
        return this.ws.isConnected && this.收到了消息
    }

    get isConnected() {
        return this.ws.isConnected
    }

}