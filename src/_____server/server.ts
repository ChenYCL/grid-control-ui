import { RealDBSyncServer } from "@/_____lib/RealDB/RealDBSyncServer";
import { CONST } from "./CONST";
import { server__funcList } from "./server__funcList";
import { server__newRealDB } from "./server__newRealDB";

export const server = new RealDBSyncServer({
    realDB: server__newRealDB(),
    funcList: server__funcList,
    path: '/' + CONST.简易密码,
    port: 6061,
})