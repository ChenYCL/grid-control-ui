import { sha256_hmac } from "../_____lib/func/sha256_hmac"
import { queryString } from "../_____lib/func/queryString"
import { toType } from "../_____lib/func/toType"
import { safeJSONParse } from "../_____lib/func/safeJSONParse"
import { waitFor } from "../_____lib/func/waitFor"
import { WebSocketClientNew } from "../_____lib/http_ws/WebSocketClient"
import { CONST } from "./CONST"

const httpRequest = async <T>({
    method = 'GET',
    url,
    body = undefined,
    headers = {},
}: {
    method?: string
    url: string
    body?: any
    headers?: { [key: string]: string }
}) => {
    const res = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (res.status >= 200 && res.status < 400) {
        return safeJSONParse(await (res.text()))
    } else {
        XXX_setFunc.log(res.status + '', {
            url,
            body: await (res.text()),
        })
        return undefined
    }

}

type OrderStatus = 'NEW' | 'CANCELED' | 'PARTIALLY_FILLED' | 'FILLED'


type OrderType = {
    type: 'STOP_MARKET'
    status: OrderStatus
    price: number
}
    |
{
    type: '突破'
    isBuy: boolean
    status: OrderStatus
    price: number
    size: number
} | {
    type: 'LIMIT'
    status: OrderStatus
    price: number
    isBuy: boolean
    只减仓: boolean
    已成交: number
    size: number
}

export const XXX_setFunc = {
    log: (k: string, v: any) => { console.log(k, v) },
    refresh横线UI: () => { },
    USD: (n: number) => { },
    onEnd: () => { },
    public_debug: (obj: any) => { },
    private_debug: (obj: any) => { },
}



const ______ = <REQ, RES, A, B>(p: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    path: string
    mapReqFunc: (v: A) => REQ
    mapResFunc: (v: RES) => B
}) => async (a: A) => {
    const aaa = queryString.stringify({
        ...p.mapReqFunc(a),
        timestamp: Date.now() - 1000 * 60,
        recvWindow: 1000 * 60 * 5,
    })

    const bbb = queryString.stringify({
        signature: sha256_hmac({ key: XXX_state.binanceSecretKey, text: aaa }),
    })

    const query = aaa + '&' + bbb

    const url = `https://fapi.binance.com/fapi/v1/${p.path}?${query}`

    const res = await httpRequest<RES>({
        method: p.method,
        url,
        headers: {
            'X-MBX-APIKEY': XXX_state.binanceAPIKey,
        },
    })

    return res !== undefined ? p.mapResFunc(res) : undefined
}

export const XXX_http = {
    new_order: ______({
        method: 'POST',
        path: 'order',
        mapReqFunc: (v: {
            symbol: string
            isBuy: boolean
            平仓: boolean
            price: number | 'market'
            size: number
        }) => {
            const obj = {
                symbol: v.symbol,
                side: v.isBuy ? 'BUY' : 'SELL',
                quantity: v.size,
            }

            return (v.price === 'market' ? {
                ...obj,
                type: 'MARKET',
            } : {
                ...obj,
                reduceOnly: v.平仓,
                type: 'LIMIT',
                price: v.price,
                timeInForce: 'GTC',
            })
        },
        mapResFunc: () => ({}),
    }),
    cancel_order: ______({
        method: 'DELETE',
        path: 'order',
        mapReqFunc: (v: {
            symbol: string
            orderID: string
        }) => ({
            symbol: v.symbol,
            orderId: v.orderID,
        }),
        mapResFunc: () => ({}),
    }),
    stop_order: ______({
        method: 'POST',
        path: 'order',
        mapReqFunc: (v: {
            symbol: string
            isBuy: boolean
            price: number
        }) => ({
            symbol: v.symbol,
            side: v.isBuy ? 'BUY' : 'SELL',
            type: 'STOP_MARKET',
            stopPrice: v.price,
            closePosition: true,
        }),
        mapResFunc: () => ({}),
    }),
    突破: ______({
        method: 'POST',
        path: 'order',
        mapReqFunc: (v: {
            symbol: string
            isBuy: boolean
            price: number
            size: number
        }) => ({
            symbol: v.symbol,
            side: v.isBuy ? 'BUY' : 'SELL',
            type: 'STOP_MARKET',
            stopPrice: v.price,
            quantity: v.size,
            timeInForce: 'GTC',
        }),
        mapResFunc: () => ({}),
    }),
    listenKey: ______({
        method: 'POST',
        path: 'listenKey',
        mapReqFunc: (v: {}) => v,
        mapResFunc: v => toType({ listenKey: '' })(v),
    }),
    put_listenKey: ______({
        method: 'PUT',
        path: 'listenKey',
        mapReqFunc: (v: {}) => v,
        mapResFunc: () => ({}),
    }),
    get_order_list: ______({
        method: 'GET',
        path: 'openOrders',
        mapReqFunc: (v: {}) => v,
        mapResFunc: v => {
            const arr = toType([
                {
                    "avgPrice": "0.00000",              // 平均成交价
                    "clientOrderId": "abc",             // 用户自定义的订单号
                    "cumQuote": "0",                        // 成交金额
                    "executedQty": "0",                 // 成交量
                    "orderId": '1917641191764119176411917641191764119176411917641',                 // 系统订单号
                    "origQty": "0.40",                  // 原始委托数量
                    "origType": "TRAILING_STOP_MARKET", // 触发前订单类型
                    "price": "0",                   // 委托价格
                    "reduceOnly": false,                // 是否仅减仓
                    "side": "BUY",                      // 买卖方向
                    "positionSide": "SHORT", // 持仓方向
                    "status": "NEW",                    // 订单状态
                    "stopPrice": "9300",                    // 触发价，对`TRAILING_STOP_MARKET`无效
                    "closePosition": false,   // 是否条件全平仓
                    "symbol": "BTCUSDT",                // 交易对
                    "time": 1579276756075,              // 订单时间
                    "timeInForce": "GTC",               // 有效方法
                    "type": "TRAILING_STOP_MARKET",     // 订单类型
                    "activatePrice": "9020", // 跟踪止损激活价格, 仅`TRAILING_STOP_MARKET` 订单返回此字段
                    "priceRate": "0.3", // 跟踪止损回调比例, 仅`TRAILING_STOP_MARKET` 订单返回此字段
                    "updateTime": 1579276756075,        // 更新时间
                    "workingType": "CONTRACT_PRICE", // 条件价格触发类型
                    "priceProtect": false            // 是否开启条件单触发保护
                }
            ])(v)


            let orderDic = Object.create(null) as {
                [symbol: string]: {
                    [orderID: string]: OrderType
                }
            }

            arr.forEach(v => {
                if (orderDic[v.symbol] === undefined) {
                    orderDic[v.symbol] = {}
                }


                const _dic = orderDic[v.symbol]
                if (v.type === 'STOP_MARKET') {
                    if (v.reduceOnly) {
                        _dic[v.orderId] = {
                            type: 'STOP_MARKET',
                            price: Number(v.stopPrice),
                            status: v.status as OrderStatus,
                        }
                    } else {
                        _dic[v.orderId] = {
                            type: '突破',
                            isBuy: v.side === 'BUY',
                            price: Number(v.stopPrice),
                            size: Number(v.origQty),
                            status: v.status as OrderStatus,
                        }
                    }
                } else if (v.type === 'LIMIT') {
                    _dic[v.orderId] = {
                        type: 'LIMIT',
                        isBuy: v.side === 'BUY',
                        只减仓: v.reduceOnly,
                        price: Number(v.price),
                        已成交: Number(v.executedQty),
                        size: Number(v.origQty),
                        status: v.status as OrderStatus,
                    }
                }

            })

            return orderDic
        },
    }),
    余额和仓位: ______({
        method: 'GET',
        path: 'account',
        mapReqFunc: (v: {}) => v,
        mapResFunc: v => {
            const obj = toType({
                "feeTier": 0,  // 手续费等级
                "canTrade": true,  // 是否可以交易
                "canDeposit": true,  // 是否可以入金
                "canWithdraw": true, // 是否可以出金
                "updateTime": 0,
                "totalInitialMargin": "0.00000000",  // 但前所需起始保证金总额(存在逐仓请忽略), 仅计算usdt资产
                "totalMaintMargin": "0.00000000",  // 维持保证金总额, 仅计算usdt资产
                "totalWalletBalance": "23.72469206",   // 账户总余额, 仅计算usdt资产
                "totalUnrealizedProfit": "0.00000000",  // 持仓未实现盈亏总额, 仅计算usdt资产
                "totalMarginBalance": "23.72469206",  // 保证金总余额, 仅计算usdt资产
                "totalPositionInitialMargin": "0.00000000",  // 持仓所需起始保证金(基于最新标记价格), 仅计算usdt资产
                "totalOpenOrderInitialMargin": "0.00000000",  // 当前挂单所需起始保证金(基于最新标记价格), 仅计算usdt资产
                "totalCrossWalletBalance": "23.72469206",  // 全仓账户余额, 仅计算usdt资产
                "totalCrossUnPnl": "0.00000000",    // 全仓持仓未实现盈亏总额, 仅计算usdt资产
                "availableBalance": "23.72469206",       // 可用余额, 仅计算usdt资产
                "maxWithdrawAmount": "23.72469206",    // 最大可转出余额, 仅计算usdt资产
                "assets": [
                    {
                        "asset": "USDT",        //资产
                        "walletBalance": "23.72469206",  //余额
                        "unrealizedProfit": "0.00000000",  // 未实现盈亏
                        "marginBalance": "23.72469206",  // 保证金余额
                        "maintMargin": "0.00000000",    // 维持保证金
                        "initialMargin": "0.00000000",  // 当前所需起始保证金
                        "positionInitialMargin": "0.00000000",  // 持仓所需起始保证金(基于最新标记价格)
                        "openOrderInitialMargin": "0.00000000", // 当前挂单所需起始保证金(基于最新标记价格)
                        "crossWalletBalance": "23.72469206",  //全仓账户余额
                        "crossUnPnl": "0.00000000",// 全仓持仓未实现盈亏
                        "availableBalance": "23.72469206",       // 可用余额
                        "maxWithdrawAmount": "23.72469206"     // 最大可转出余额
                    },
                    {
                        "asset": "BUSD",        //资产
                        "walletBalance": "103.12345678",  //余额
                        "unrealizedProfit": "0.00000000",  // 未实现盈亏
                        "marginBalance": "103.12345678",  // 保证金余额
                        "maintMargin": "0.00000000",    // 维持保证金
                        "initialMargin": "0.00000000",  // 当前所需起始保证金
                        "positionInitialMargin": "0.00000000",  // 持仓所需起始保证金(基于最新标记价格)
                        "openOrderInitialMargin": "0.00000000", // 当前挂单所需起始保证金(基于最新标记价格)
                        "crossWalletBalance": "103.12345678",  //全仓账户余额
                        "crossUnPnl": "0.00000000", // 全仓持仓未实现盈亏
                        "availableBalance": "103.12345678",       // 可用余额
                        "maxWithdrawAmount": "103.12345678"     // 最大可转出余额
                    }
                ],
                "positions": [  // 头寸，将返回所有市场symbol。
                    //根据用户持仓模式展示持仓方向，即双向模式下只返回BOTH持仓情况，单向模式下只返回 LONG 和 SHORT 持仓情况
                    {
                        "symbol": "BTCUSDT",  // 交易对
                        "initialMargin": "0",   // 当前所需起始保证金(基于最新标记价格)
                        "maintMargin": "0", //维持保证金
                        "unrealizedProfit": "0.00000000",  // 持仓未实现盈亏
                        "positionInitialMargin": "0",  // 持仓所需起始保证金(基于最新标记价格)
                        "openOrderInitialMargin": "0",  // 当前挂单所需起始保证金(基于最新标记价格)
                        "leverage": "100",  // 杠杆倍率
                        "isolated": true,  // 是否是逐仓模式
                        "entryPrice": "0.00000",  // 持仓成本价
                        "maxNotional": "250000",  // 当前杠杆下用户可用的最大名义价值
                        "positionSide": "BOTH",  // 持仓方向
                        "positionAmt": "0"      // 持仓数量
                    }
                ]
            })(v)


            let positionDic = Object.create(null) as {
                [symbol: string]: {
                    price: number
                    size: number
                }
            }

            obj.positions.forEach(v => {
                positionDic[v.symbol] = {
                    price: Number(v.entryPrice),
                    size: Number(v.positionAmt),
                }
            })

            return {
                BUSD: Number(obj.assets.find(v => v.asset === 'BUSD')?.marginBalance || 0),
                positionDic,
            }
        },
    }),
}


export const XXX_state = {
    binanceAPIKey: CONST.binanceAPIKey,
    binanceSecretKey: CONST.binanceSecretKey,
    task参数: {
        价位A: 0,
        价位B: 0,
        上下几格: 0,
        点差: 0,
        size: 0,
    },
    USD: 0,

    positionDic: {} as {
        [symbol: string]: {
            price: number;
            size: number;
        };
    },

    orderDic: {} as {
        [symbol: string]: {
            [orderID: string]: OrderType
        };
    },
}








const init = async () => {
    let 余额和仓位 = await XXX_http.余额和仓位({})
    XXX_setFunc.log('余额和仓位', 余额和仓位)
    if (余额和仓位 === undefined) {
        XXX_setFunc.log('余额和仓位 加载 错误', 余额和仓位)
        return
    }
    XXX_state.USD = 余额和仓位.BUSD
    XXX_state.positionDic = 余额和仓位.positionDic
    XXX_setFunc.refresh横线UI()

    let orderList = await XXX_http.get_order_list({})
    if (orderList === undefined) {
        XXX_setFunc.log('orderList 加载 错误', orderList)
        return
    }
    XXX_state.orderDic = orderList
    XXX_setFunc.refresh横线UI()

    let listenKey = await XXX_http.listenKey({})
    if (listenKey === undefined) {
        XXX_setFunc.log('listenKey 加载 错误', listenKey)
        return
    }


    setInterval(() => XXX_http.put_listenKey({}), 50 * 60 * 1000)

    const privateWS = WebSocketClientNew({
        log_tag: 'binance private',
        url: `wss://fstream.binance.com/ws/${listenKey.listenKey}`,
    })

    privateWS.onRecvJSON = v => {
        const eventName = toType({ e: '' })(v).e

        if (eventName === 'ORDER_TRADE_UPDATE') {
            const sample = {
                "e": "ORDER_TRADE_UPDATE",         // 事件类型
                "E": 1568879465651,                // 事件时间
                "T": 1568879465650,                // 撮合时间
                "o": {
                    "s": "BTCUSDT",                  // 交易对
                    "c": "TEST",                     // 客户端自定订单ID
                    // 特殊的自定义订单ID:
                    // "autoclose-"开头的字符串: 系统强平订单
                    // "adl_autoclose": ADL自动减仓订单
                    "S": "SELL",                     // 订单方向
                    "o": "TRAILING_STOP_MARKET", // 订单类型
                    "f": "GTC",                      // 有效方式
                    "q": "0.001",                    // 订单原始数量
                    "p": "0",                        // 订单原始价格
                    "ap": "0",                       // 订单平均价格
                    "sp": "7103.04",                 // 条件订单触发价格，对追踪止损单无效
                    "x": "NEW",                      // 本次事件的具体执行类型
                    "X": "NEW",                      // 订单的当前状态
                    "i": '888677488867748886774888677488867748886774888677488867748886774888677488867748886774888677488867748886774',                    // 订单ID
                    "l": "0",                        // 订单末次成交量
                    "z": "0",                        // 订单累计已成交量
                    "L": "0",                        // 订单末次成交价格
                    "N": "USDT",                    // 手续费资产类型
                    "n": "0",                       // 手续费数量
                    "T": 1568879465651,              // 成交时间
                    "t": 0,                          // 成交ID
                    "b": "0",                        // 买单净值
                    "a": "9.91",                     // 卖单净值
                    "m": false,                     // 该成交是作为挂单成交吗？
                    "R": false,                   // 是否是只减仓单
                    "wt": "CONTRACT_PRICE",         // 触发价类型
                    "ot": "TRAILING_STOP_MARKET",   // 原始订单类型
                    "ps": "LONG",                    // 持仓方向
                    "cp": false,                     // 是否为触发平仓单; 仅在条件订单情况下会推送此字段
                    "AP": "7476.89",                 // 追踪止损激活价格, 仅在追踪止损单时会推送此字段
                    "cr": "5.0",                     // 追踪止损回调比例, 仅在追踪止损单时会推送此字段
                    "rp": "0"                            // 该交易实现盈亏

                }

            }

            const { o } = toType(sample)(v)

            const symbol = String(o.s)
            const orderID = o.i
            const is平仓 = Boolean(o.R)
            const 订单类型 = String(o.o) as 'LIMIT' | 'STOP_MARKET'
            const 订单状态 = String(o.X) as 'NEW' | 'CANCELED' | 'PARTIALLY_FILLED' | 'FILLED'
            const stopPrice = Number(o.sp)
            const price = Number(o.p)
            const 已成交 = Number(o.z)
            const size = Number(o.q)

            if (XXX_state.orderDic[symbol] === undefined) {
                XXX_state.orderDic[symbol] = {
                }
            }

            if (订单类型 === 'STOP_MARKET') {
                if (is平仓) {
                    XXX_state.orderDic[symbol][orderID] = {
                        type: 'STOP_MARKET',
                        status: 订单状态,
                        price: stopPrice,
                    }
                } else {
                    XXX_state.orderDic[symbol][orderID] = {
                        type: '突破',
                        isBuy: o.S === 'BUY',
                        status: 订单状态,
                        price: stopPrice,
                        size,
                    }
                }
            } else if (订单类型 === 'LIMIT') {
                XXX_state.orderDic[symbol][orderID] = {
                    type: 'LIMIT',
                    isBuy: o.S === 'BUY',
                    status: 订单状态,
                    price,
                    只减仓: is平仓,
                    已成交,
                    size,
                }
            }
            XXX_setFunc.refresh横线UI()
        }
        else if (eventName === 'ACCOUNT_UPDATE') {
            const sample = {
                "e": "ACCOUNT_UPDATE",                // 事件类型
                "E": 1564745798939,                   // 事件时间
                "T": 1564745798938,                  // 撮合时间
                "a":                                  // 账户更新事件
                {
                    "m": "ORDER",                      // 事件推出原因
                    "B": [                             // 余额信息
                        {
                            "a": "USDT",                   // 资产名称
                            "wb": "122624.12345678",       // 钱包余额
                            "cw": "100.12345678"           // 除去逐仓仓位保证金的钱包余额
                        },
                        {
                            "a": "BNB",
                            "wb": "1.00000000",
                            "cw": "0.00000000"
                        }
                    ],
                    "P": [
                        {
                            "s": "BTCUSDT",            // 交易对
                            "pa": "0",                 // 仓位
                            "ep": "0.00000",            // 入仓价格
                            "cr": "200",               // (费前)累计实现损益
                            "up": "0",                     // 持仓未实现盈亏
                            "mt": "isolated",              // 保证金模式
                            "iw": "0.00000000",            // 若为逐仓，仓位保证金
                            "ps": "BOTH"                   // 持仓方向
                        },
                        {
                            "s": "BTCUSDT",
                            "pa": "20",
                            "ep": "6563.66500",
                            "cr": "0",
                            "up": "2850.21200",
                            "mt": "isolated",
                            "iw": "13200.70726908",
                            "ps": "LONG"
                        },
                        {
                            "s": "BTCUSDT",
                            "pa": "-10",
                            "ep": "6563.86000",
                            "cr": "-45.04000000",
                            "up": "-1423.15600",
                            "mt": "isolated",
                            "iw": "6570.42511771",
                            "ps": "SHORT"
                        }
                    ]
                }
            }
            const { a } = toType(sample)(v)
            XXX_state.USD = Number(a.B.find(v => v.a === 'BUSD')?.cw || 0)
            XXX_setFunc.USD(XXX_state.USD)
            a.P.forEach(v => {
                if (v.ps === 'BOTH') {
                    XXX_state.positionDic[v.s] = {
                        price: Number(v.ep),
                        size: Number(v.pa),
                    }
                }
            })
            XXX_setFunc.refresh横线UI()
        }

        XXX_setFunc.private_debug(v)
    }

    XXX_setFunc.USD(XXX_state.USD)
}

init()




























































const SYMBOL = 'BTCBUSD'

const ___grid = ({
    a,
    b,
    count,
    dx,
}: {
    a: number
    b: number
    count: number
    dx: number
}) => {
    const arr: {
        price: number;
        SL: number;
        TP: number;
        orderType: 'Buy Limit' | 'Sell Limit';
        仓位: number
    }[] = []

    const buy1 = Math.min(a, b)
    const sell1 = Math.max(a, b)
    const one = sell1 - buy1

    const low = buy1 - one * count
    const high = sell1 + one * count

    for (let i = 0; i < count; i++) {
        const low_i = buy1 - i * one
        const high_i = sell1 + i * one

        arr.push({
            price: low_i + dx,
            SL: low,
            TP: low_i + one - dx,
            orderType: 'Buy Limit',
            仓位: XXX_state.task参数.size * (i + 1),
        })


        arr.push({
            price: high_i - dx,
            SL: high,
            TP: high_i - one + dx,
            orderType: 'Sell Limit',
            仓位: -XXX_state.task参数.size * (i + 1),
        })
    }

    const list = arr.map(v => ({
        price: Number(v.price.toFixed(8)),
        SL: Number(v.SL.toFixed(8)),
        TP: Number(v.TP.toFixed(8)),
        orderType: v.orderType,
        仓位: Number(v.仓位.toFixed(8)),
    }))

    return {
        low: Number(low.toFixed(8)),
        high: Number(high.toFixed(8)),
        list
    }
}


let orderBook = { buy1: 0, sell1: 0 }


const publicWS = WebSocketClientNew({
    log_tag: 'binance public',
    url: 'wss://fstream.binance.com/stream',
})

publicWS.onStatusChange = () => {
    if (publicWS.isConnected) {
        publicWS.sendJSON({
            "method": "SUBSCRIBE",
            "params": [`${SYMBOL.toLowerCase()}@depth5@100ms`],
            "id": 6666,
        })
    }
}


publicWS.onRecvJSON = p => {
    const { stream, data } = p as { stream: string, data: any }
    const type = ((stream || '').split('@')[1] || '').split('_')[0]

    if (type === 'depth5') {
        // const symbol = String(data.s)
        const buy1 = Number(data.b[0][0])
        const sell1 = Number(data.a[0][0])
        orderBook = { buy1, sell1 }
        XXX_setFunc.public_debug({ buy1, sell1 })
    }
}



const btcTask = async () => {
    while (true) {
        if (XXX_state.task参数.价位A === 0) {
            await waitFor(100)
            continue
        }

        const { low, high, list } = ___grid({
            a: XXX_state.task参数.价位A,
            b: XXX_state.task参数.价位B,
            count: XXX_state.task参数.上下几格,
            dx: XXX_state.task参数.点差,
        })

        const order = Object.values(XXX_state.orderDic[SYMBOL] || {})
        const { buy1, sell1 } = orderBook
        const position = XXX_state.positionDic[SYMBOL] || { size: 0, price: 0 }

        if (buy1 !== 0 && sell1 !== 0) {
            if (sell1 < low || buy1 > high) {
                XXX_state.task参数.价位A = 0
                XXX_setFunc.onEnd()
                return
            }
        }


        //同步止损
        if (order.some(v => v.price === low && v.type === 'STOP_MARKET' && v.status === 'NEW') === false) {
            console.log('同步止损 low', low)
            XXX_http.stop_order({
                symbol: SYMBOL,
                price: low,
                isBuy: false,
            })
        }


        if (order.some(v => v.price === high && v.type === 'STOP_MARKET' && v.status === 'NEW') === false) {
            console.log('同步止损 high', high)
            XXX_http.stop_order({
                symbol: SYMBOL,
                price: high,
                isBuy: true,
            })
        }

        const 同步委托 = ({ price, isBuy, is减仓 }: { price: number; isBuy: boolean; is减仓: boolean; }) => {
            is减仓 = false
            if (order.some(v => v.price === price
                && v.type === 'LIMIT'
                && (v.status === 'NEW' || v.status === 'PARTIALLY_FILLED')
                && v.isBuy === isBuy
                && v.只减仓 === is减仓
            ) === false) {
                if (
                    (isBuy && sell1 > price)
                    ||
                    ((!isBuy) && buy1 < price)
                ) {
                    console.log('同步委托', price, isBuy ? 'Buy' : 'Sell', is减仓 ? 'TP' : 'OPEN')
                    XXX_http.new_order({
                        symbol: SYMBOL,
                        isBuy,
                        平仓: is减仓,
                        price,
                        size: XXX_state.task参数.size,
                    })
                }
            }
        }

        list.forEach(v => {
            if (v.orderType === 'Buy Limit') {
                //同步开仓
                if (position.size < v.仓位) {
                    同步委托({ price: v.price, isBuy: true, is减仓: false })
                }
                //同步平仓 
                else {
                    同步委托({ price: v.TP - 0.1, isBuy: false, is减仓: true })
                }

            }
            else if (v.orderType === 'Sell Limit') {
                //同步开仓
                if (position.size > v.仓位) {
                    同步委托({ price: v.price, isBuy: false, is减仓: false })
                }
                //同步平仓 
                else {
                    同步委托({ price: v.TP + 0.1, isBuy: true, is减仓: true })
                }
            }
        })

        await waitFor(5000)
    }
}
btcTask()