import { RealDB } from "../_____lib/RealDB/RealDB";

export const server__newRealDB = () => new RealDB({
    time: '--',
    BUSD: 0,
    dic: {
        BTCBUSD: {
            委托: [],
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
    } as {
        [symbol: string]: {
            委托: {
                size: number
                price: number
            }[],
            仓位: {
                size: number
                price: number
            },
            运行中: boolean
            参数: {
                a: number
                b: number
                count: number
                size: number
                dx: number
            }
        }
    }
})