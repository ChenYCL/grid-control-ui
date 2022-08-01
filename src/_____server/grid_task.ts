import { waitFor } from '../_____lib/func/waitFor'
import { SYMBOL, XXX_http, XXX_state, orderBook } from './BinanceXXX'
import { server } from './server'

function grid_to_sync_list({
  a, b, count, dx,
}: {
  a: number
  b: number
  count: number
  dx: number
}) {
  const task参数 = server.realDB.mutableData.dic.BTCBUSD.参数

  const arr: {
    price: number
    SL: number
    TP: number
    orderType: 'Buy Limit' | 'Sell Limit'
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
      仓位: task参数.size * (i + 1),
    })

    arr.push({
      price: high_i - dx,
      SL: high,
      TP: high_i - one + dx,
      orderType: 'Sell Limit',
      仓位: -task参数.size * (i + 1),
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
    list,
  }
}

export async function grid_task() {
  while (true) {
    const 运行中 = server.realDB.mutableData.dic.BTCBUSD.运行中
    if (运行中 === false) {
      await waitFor(100)
      continue
    }

    const task参数 = server.realDB.mutableData.dic.BTCBUSD.参数
    const { low, high, list } = grid_to_sync_list({
      a: task参数.a,
      b: task参数.b,
      count: task参数.count,
      dx: task参数.dx,
    })

    const order = Object.values(XXX_state.orderDic[SYMBOL] || {})
    const { buy1, sell1 } = orderBook
    const position = XXX_state.positionDic[SYMBOL] || { size: 0, price: 0 }

    if (buy1 !== 0 && sell1 !== 0) {
      if (sell1 < low || buy1 > high) {
        server.realDB.__(v => v.dic['BTCBUSD'].运行中).set(false)
        return
      }
    }

    // 同步止损
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

    const 同步委托 = ({ price, isBuy, is减仓 }: { price: number; isBuy: boolean; is减仓: boolean }) => {
      is减仓 = false
      if (order.some(v => v.price === price
        && v.type === 'LIMIT'
        && (v.status === 'NEW' || v.status === 'PARTIALLY_FILLED')
        && v.isBuy === isBuy
        && v.只减仓 === is减仓,
      ) === false) {
        if ((isBuy && sell1 > price)
          || ((!isBuy) && buy1 < price)) {
          console.log('同步委托', price, isBuy ? 'Buy' : 'Sell', is减仓 ? 'TP' : 'OPEN')
          XXX_http.new_order({
            symbol: SYMBOL,
            isBuy,
            平仓: is减仓,
            price,
            size: task参数.size,
          })
        }
      }
    }

    list.forEach((v) => {
      if (v.orderType === 'Buy Limit') {
        // 同步开仓
        if (position.size < v.仓位) {
          同步委托({ price: v.price, isBuy: true, is减仓: false })
        }

        // 同步平仓
        else {
          同步委托({ price: v.TP - 0.1, isBuy: false, is减仓: true })
        }
      } else if (v.orderType === 'Sell Limit') {
        // 同步开仓
        if (position.size > v.仓位) {
          同步委托({ price: v.price, isBuy: false, is减仓: false })
        }

        // 同步平仓
        else {
          同步委托({ price: v.TP + 0.1, isBuy: true, is减仓: true })
        }
      }
    })

    await waitFor(5000)
  }
}
