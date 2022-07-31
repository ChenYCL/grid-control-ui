import { RealDBSyncClient } from "@/_____lib/RealDB/RealDBSyncClient";
import { server__funcList } from "./_____server/server__funcList";
import { server__newRealDB } from "./_____server/server__newRealDB";

export const client = new RealDBSyncClient({
    url: `ws://127.0.0.1:6061/vFSDGwsdftgqfvasd23`,
    realDB: server__newRealDB(),
    funcList: server__funcList,
})

const w = window as any
w.client = client

// 函数调用
// client.func.xxxx

// 数据
// client.realDB.mutableData

// 刷新界面
// client.onData.subscribe(刷新界面func)