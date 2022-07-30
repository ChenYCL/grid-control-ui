import { parse } from "url"

const socksProxyAgent = require('socks-proxy-agent')
const hostArr: string[] = [
    // 'fapi.binance.com',
    // 'fstream.binance.com',

    // //
    // 'secure.icmarkets.com',
]

export const getAgentWithURL = (url: string) => {
    const host = parse(url).host || ''
    return hostArr.some((v) => v === host)
        ? new socksProxyAgent('socks://127.0.0.1:1080')
        : undefined
}