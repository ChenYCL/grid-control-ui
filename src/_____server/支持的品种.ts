export const 支持的品种dic = {
    BTCBUSD: { tickSize: 0.1, stepSize: 0.001 },
    ETHBUSD: { tickSize: 0.01, stepSize: 0.001 },
    SOLBUSD: { tickSize: 0.01, stepSize: 1 },
    DOTBUSD: { tickSize: 0.001, stepSize: 0.1 },
}


export type 支持的品种T = keyof typeof 支持的品种dic

export const 支持的品种arr = Object.keys(支持的品种dic) as 支持的品种T[]