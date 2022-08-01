import { grid_task } from "./grid_task"
import { server } from "./server"
import { 支持的品种arr } from "./支持的品种"

支持的品种arr.forEach(grid_task)

setInterval(() => {
    server.realDB.__(v => v.time).set(new Date().toLocaleString())
}, 500)

const symbol有 = (symbol: string) =>
    支持的品种arr.some(v => v === symbol)

server.func.set = req => {
    if (symbol有(req.symbol)) {
        server.realDB.__(v => v.dic[req.symbol].参数).set(req.参数)
    }
}

server.func.start = req => {
    if (symbol有(req.symbol)) {
        console.log('开启', req.symbol)
        server.realDB.__(v => v.dic[req.symbol].运行中).set(true)
    }
}

server.func.stop = req => {
    if (symbol有(req.symbol)) {
        console.log('停止', req.symbol)
        server.realDB.__(v => v.dic[req.symbol].运行中).set(false)
    }
}