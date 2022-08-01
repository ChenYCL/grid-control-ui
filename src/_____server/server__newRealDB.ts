import { mapObjIndexed } from "ramda";
import { RealDB } from "../_____lib/RealDB/RealDB";
import { 支持的品种dic } from "./支持的品种";

export const server__newRealDB = () => new RealDB({
    time: '--',
    BUSD: 0,
    dic: mapObjIndexed(() => {
        return {
            委托: [] as {
                size: number
                price: number
            }[],
            仓位: {
                size: 0,
                price: 0,
            },
            运行中: false,
            参数: {
                a: 20000,
                b: 30000,
                count: 2,
                size: 0.001,
                dx: 15,
            }
        }
    }, 支持的品种dic)


})