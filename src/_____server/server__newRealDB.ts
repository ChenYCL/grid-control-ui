import { RealDB } from "../_____lib/RealDB/RealDB";

export const server__newRealDB = () => new RealDB({
    time: '--',
    BUSD: 0,
    dic: {
        BTCBUSD: {
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