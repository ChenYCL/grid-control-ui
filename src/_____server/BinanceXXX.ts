import { sha256_hmac } from '../_____lib/func/sha256_hmac'
import { queryString } from '../_____lib/func/queryString'
import { toType } from '../_____lib/func/toType'
import { WebSocketClientNew } from '../_____lib/http_ws/WebSocketClient'
import { httpRequest } from '../_____lib/nodejs_lib/httpRequest'
import { CONST } from './CONST'
import { server } from './server'
import { 支持的品种arr, 支持的品种dic, 支持的品种T } from './支持的品种'
import { mapObjIndexed } from 'ramda'

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

export const XXX_state = {
  positionDic: {} as {
    [symbol: string]: {
      price: number
      size: number
    }
  },
  orderDic: {} as {
    [symbol: string]: {
      [orderID: string]: OrderType
    }
  },
}

const 刷新仓位和委托 = () => {
  server.realDB.__(v => v.dic['BTCBUSD'].仓位).set({
    price: XXX_state.positionDic['BTCBUSD']?.price || 0,
    size: XXX_state.positionDic['BTCBUSD']?.size || 0,
  })

  const arr = Object.values(XXX_state.orderDic['BTCBUSD'] || {}).filter(v => v.type === 'LIMIT')
    .map(v => {
      if (v.type === 'LIMIT') {
        return {
          price: v.price,
          size: v.isBuy ? v.size : -v.size,
        }
      } else {
        return {
          price: 0,
          size: 0,
        }
      }
    })

  server.realDB.__(v => v.dic['BTCBUSD'].委托).set(arr)
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
    signature: sha256_hmac({
      key: CONST.binanceSecretKey,
      text: aaa,
    }),
  })

  const query = `${aaa}&${bbb}`

  const url = `https://fapi.binance.com/fapi/v1/${p.path}?${query}`

  const res = await httpRequest<RES>({
    method: p.method,
    url,
    headers: {
      'X-MBX-APIKEY': CONST.binanceAPIKey,
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

      return (v.price === 'market'
        ? {
          ...obj,
          type: 'MARKET',
        }
        : {
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
    mapResFunc: (v) => {
      const arr = toType([
        {
          avgPrice: '0.00000', // 平均成交价
          clientOrderId: 'abc', // 用户自定义的订单号
          cumQuote: '0', // 成交金额
          executedQty: '0', // 成交量
          orderId: '1917641191764119176411917641191764119176411917641', // 系统订单号
          origQty: '0.40', // 原始委托数量
          origType: 'TRAILING_STOP_MARKET', // 触发前订单类型
          price: '0', // 委托价格
          reduceOnly: false, // 是否仅减仓
          side: 'BUY', // 买卖方向
          positionSide: 'SHORT', // 持仓方向
          status: 'NEW', // 订单状态
          stopPrice: '9300', // 触发价，对`TRAILING_STOP_MARKET`无效
          closePosition: false, // 是否条件全平仓
          symbol: 'BTCUSDT', // 交易对
          time: 1579276756075, // 订单时间
          timeInForce: 'GTC', // 有效方法
          type: 'TRAILING_STOP_MARKET', // 订单类型
          activatePrice: '9020', // 跟踪止损激活价格, 仅`TRAILING_STOP_MARKET` 订单返回此字段
          priceRate: '0.3', // 跟踪止损回调比例, 仅`TRAILING_STOP_MARKET` 订单返回此字段
          updateTime: 1579276756075, // 更新时间
          workingType: 'CONTRACT_PRICE', // 条件价格触发类型
          priceProtect: false, // 是否开启条件单触发保护
        },
      ])(v)

      const orderDic = Object.create(null) as {
        [symbol: string]: {
          [orderID: string]: OrderType
        }
      }

      arr.forEach((v) => {
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
    mapResFunc: (v) => {
      const obj = toType({
        feeTier: 0, // 手续费等级
        canTrade: true, // 是否可以交易
        canDeposit: true, // 是否可以入金
        canWithdraw: true, // 是否可以出金
        updateTime: 0,
        totalInitialMargin: '0.00000000', // 但前所需起始保证金总额(存在逐仓请忽略), 仅计算usdt资产
        totalMaintMargin: '0.00000000', // 维持保证金总额, 仅计算usdt资产
        totalWalletBalance: '23.72469206', // 账户总余额, 仅计算usdt资产
        totalUnrealizedProfit: '0.00000000', // 持仓未实现盈亏总额, 仅计算usdt资产
        totalMarginBalance: '23.72469206', // 保证金总余额, 仅计算usdt资产
        totalPositionInitialMargin: '0.00000000', // 持仓所需起始保证金(基于最新标记价格), 仅计算usdt资产
        totalOpenOrderInitialMargin: '0.00000000', // 当前挂单所需起始保证金(基于最新标记价格), 仅计算usdt资产
        totalCrossWalletBalance: '23.72469206', // 全仓账户余额, 仅计算usdt资产
        totalCrossUnPnl: '0.00000000', // 全仓持仓未实现盈亏总额, 仅计算usdt资产
        availableBalance: '23.72469206', // 可用余额, 仅计算usdt资产
        maxWithdrawAmount: '23.72469206', // 最大可转出余额, 仅计算usdt资产
        assets: [
          {
            asset: 'USDT', // 资产
            walletBalance: '23.72469206', // 余额
            unrealizedProfit: '0.00000000', // 未实现盈亏
            marginBalance: '23.72469206', // 保证金余额
            maintMargin: '0.00000000', // 维持保证金
            initialMargin: '0.00000000', // 当前所需起始保证金
            positionInitialMargin: '0.00000000', // 持仓所需起始保证金(基于最新标记价格)
            openOrderInitialMargin: '0.00000000', // 当前挂单所需起始保证金(基于最新标记价格)
            crossWalletBalance: '23.72469206', // 全仓账户余额
            crossUnPnl: '0.00000000', // 全仓持仓未实现盈亏
            availableBalance: '23.72469206', // 可用余额
            maxWithdrawAmount: '23.72469206', // 最大可转出余额
          },
          {
            asset: 'BUSD', // 资产
            walletBalance: '103.12345678', // 余额
            unrealizedProfit: '0.00000000', // 未实现盈亏
            marginBalance: '103.12345678', // 保证金余额
            maintMargin: '0.00000000', // 维持保证金
            initialMargin: '0.00000000', // 当前所需起始保证金
            positionInitialMargin: '0.00000000', // 持仓所需起始保证金(基于最新标记价格)
            openOrderInitialMargin: '0.00000000', // 当前挂单所需起始保证金(基于最新标记价格)
            crossWalletBalance: '103.12345678', // 全仓账户余额
            crossUnPnl: '0.00000000', // 全仓持仓未实现盈亏
            availableBalance: '103.12345678', // 可用余额
            maxWithdrawAmount: '103.12345678', // 最大可转出余额
          },
        ],
        positions: [ // 头寸，将返回所有市场symbol。
          // 根据用户持仓模式展示持仓方向，即双向模式下只返回BOTH持仓情况，单向模式下只返回 LONG 和 SHORT 持仓情况
          {
            symbol: 'BTCUSDT', // 交易对
            initialMargin: '0', // 当前所需起始保证金(基于最新标记价格)
            maintMargin: '0', // 维持保证金
            unrealizedProfit: '0.00000000', // 持仓未实现盈亏
            positionInitialMargin: '0', // 持仓所需起始保证金(基于最新标记价格)
            openOrderInitialMargin: '0', // 当前挂单所需起始保证金(基于最新标记价格)
            leverage: '100', // 杠杆倍率
            isolated: true, // 是否是逐仓模式
            entryPrice: '0.00000', // 持仓成本价
            maxNotional: '250000', // 当前杠杆下用户可用的最大名义价值
            positionSide: 'BOTH', // 持仓方向
            positionAmt: '0', // 持仓数量
          },
        ],
      })(v)

      const positionDic = Object.create(null) as {
        [symbol: string]: {
          price: number
          size: number
        }
      }

      obj.positions.forEach((v) => {
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

const init = async () => {
  const 余额和仓位 = await XXX_http.余额和仓位({})
  console.log('余额和仓位', 余额和仓位)
  if (余额和仓位 === undefined) {
    console.log('余额和仓位 加载 错误', 余额和仓位)
    return
  }
  server.realDB.__(v => v.BUSD).set(余额和仓位.BUSD)
  XXX_state.positionDic = 余额和仓位.positionDic

  const orderList = await XXX_http.get_order_list({})
  if (orderList === undefined) {
    console.log('orderList 加载 错误', orderList)
    return
  }
  XXX_state.orderDic = orderList
  刷新仓位和委托()

  const listenKey = await XXX_http.listenKey({})
  if (listenKey === undefined) {
    console.log('listenKey 加载 错误', listenKey)
    return
  }

  setInterval(() => XXX_http.put_listenKey({}), 50 * 60 * 1000)

  const privateWS = WebSocketClientNew({
    log_tag: 'binance private',
    url: `wss://fstream.binance.com/ws/${listenKey.listenKey}`,
  })

  privateWS.onRecvJSON = (v) => {
    const eventName = toType({ e: '' })(v).e

    if (eventName === 'ORDER_TRADE_UPDATE') {
      const sample = {
        e: 'ORDER_TRADE_UPDATE', // 事件类型
        E: 1568879465651, // 事件时间
        T: 1568879465650, // 撮合时间
        o: {
          s: 'BTCUSDT', // 交易对
          c: 'TEST', // 客户端自定订单ID
          // 特殊的自定义订单ID:
          // "autoclose-"开头的字符串: 系统强平订单
          // "adl_autoclose": ADL自动减仓订单
          S: 'SELL', // 订单方向
          o: 'TRAILING_STOP_MARKET', // 订单类型
          f: 'GTC', // 有效方式
          q: '0.001', // 订单原始数量
          p: '0', // 订单原始价格
          ap: '0', // 订单平均价格
          sp: '7103.04', // 条件订单触发价格，对追踪止损单无效
          x: 'NEW', // 本次事件的具体执行类型
          X: 'NEW', // 订单的当前状态
          i: '888677488867748886774888677488867748886774888677488867748886774888677488867748886774888677488867748886774', // 订单ID
          l: '0', // 订单末次成交量
          z: '0', // 订单累计已成交量
          L: '0', // 订单末次成交价格
          N: 'USDT', // 手续费资产类型
          n: '0', // 手续费数量
          T: 1568879465651, // 成交时间
          t: 0, // 成交ID
          b: '0', // 买单净值
          a: '9.91', // 卖单净值
          m: false, // 该成交是作为挂单成交吗？
          R: false, // 是否是只减仓单
          wt: 'CONTRACT_PRICE', // 触发价类型
          ot: 'TRAILING_STOP_MARKET', // 原始订单类型
          ps: 'LONG', // 持仓方向
          cp: false, // 是否为触发平仓单; 仅在条件订单情况下会推送此字段
          AP: '7476.89', // 追踪止损激活价格, 仅在追踪止损单时会推送此字段
          cr: '5.0', // 追踪止损回调比例, 仅在追踪止损单时会推送此字段
          rp: '0', // 该交易实现盈亏

        },

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

      刷新仓位和委托()
    } else if (eventName === 'ACCOUNT_UPDATE') {
      const sample = {
        e: 'ACCOUNT_UPDATE', // 事件类型
        E: 1564745798939, // 事件时间
        T: 1564745798938, // 撮合时间
        a: // 账户更新事件
        {
          m: 'ORDER', // 事件推出原因
          B: [ // 余额信息
            {
              a: 'USDT', // 资产名称
              wb: '122624.12345678', // 钱包余额
              cw: '100.12345678', // 除去逐仓仓位保证金的钱包余额
            },
            {
              a: 'BNB',
              wb: '1.00000000',
              cw: '0.00000000',
            },
          ],
          P: [
            {
              s: 'BTCUSDT', // 交易对
              pa: '0', // 仓位
              ep: '0.00000', // 入仓价格
              cr: '200', // (费前)累计实现损益
              up: '0', // 持仓未实现盈亏
              mt: 'isolated', // 保证金模式
              iw: '0.00000000', // 若为逐仓，仓位保证金
              ps: 'BOTH', // 持仓方向
            },
            {
              s: 'BTCUSDT',
              pa: '20',
              ep: '6563.66500',
              cr: '0',
              up: '2850.21200',
              mt: 'isolated',
              iw: '13200.70726908',
              ps: 'LONG',
            },
            {
              s: 'BTCUSDT',
              pa: '-10',
              ep: '6563.86000',
              cr: '-45.04000000',
              up: '-1423.15600',
              mt: 'isolated',
              iw: '6570.42511771',
              ps: 'SHORT',
            },
          ],
        },
      }
      const { a } = toType(sample)(v)
      server.realDB.__(v => v.BUSD).set(Number(a.B.find(v => v.a === 'BUSD')?.cw || 0))
      a.P.forEach((v) => {
        if (v.ps === 'BOTH') {
          XXX_state.positionDic[v.s] = {
            price: Number(v.ep),
            size: Number(v.pa),
          }
        }
      })
      刷新仓位和委托()
    }
  }
}

init()


export let orderBookDic = mapObjIndexed(() => ({ buy1: 0, sell1: 0 }), 支持的品种dic)


const publicWS = WebSocketClientNew({
  log_tag: 'binance public',
  url: 'wss://fstream.binance.com/stream',
})

publicWS.onStatusChange = () => {
  if (publicWS.isConnected) {
    publicWS.sendJSON({
      method: 'SUBSCRIBE',
      params: 支持的品种arr.map(v => `${v.toLowerCase()}@depth5@100ms`),
      id: 6666,
    })
  }
}

publicWS.onRecvJSON = (p) => {
  const { stream, data } = p as { stream: string; data: any }
  const type = ((stream || '').split('@')[1] || '').split('_')[0]

  if (type === 'depth5') {
    const symbol = String(data.s) as 支持的品种T
    const buy1 = Number(data.b[0][0])
    const sell1 = Number(data.a[0][0])
    orderBookDic[symbol] = { buy1, sell1 }
  }
}
