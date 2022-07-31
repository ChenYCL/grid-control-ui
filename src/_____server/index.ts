import { RealDBSyncServer } from "../_____lib/RealDB/RealDBSyncServer";
import { server__newRealDB } from "./server__newRealDB";
import { server__funcList } from "./server__funcList";
import { CONST } from "./CONST";

export const server = new RealDBSyncServer({
    realDB: server__newRealDB(),
    funcList: server__funcList,
    path: '/' + CONST.简易密码,
    port: 6061,
})

setInterval(() => {
    server.realDB.__(v => v.time).set(new Date().toLocaleString())
}, 500)

const symbol有 = (symbol: string) => symbol === 'BTCBUSD'

server.func.set = req => {
    if (symbol有(req.symbol)) {
        server.realDB.__(v => v.dic[req.symbol].参数).set(req.参数)
    }
}

server.func.start = req => {
    if (symbol有(req.symbol)) {
        server.realDB.__(v => v.dic[req.symbol].运行中).set(true)
    }
}

server.func.stop = req => {
    if (symbol有(req.symbol)) {
        server.realDB.__(v => v.dic[req.symbol].运行中).set(false)
    }
}