import { XXX_state } from "./BinanceXXX";


export function grid_to_sync_list({
    a, b, count, dx,
}: {
    a: number;
    b: number;
    count: number;
    dx: number;
}) {
    const arr: {
        price: number;
        SL: number;
        TP: number;
        orderType: 'Buy Limit' | 'Sell Limit';
        仓位: number;
    }[] = [];

    const buy1 = Math.min(a, b);
    const sell1 = Math.max(a, b);
    const one = sell1 - buy1;

    const low = buy1 - one * count;
    const high = sell1 + one * count;

    for (let i = 0; i < count; i++) {
        const low_i = buy1 - i * one;
        const high_i = sell1 + i * one;

        arr.push({
            price: low_i + dx,
            SL: low,
            TP: low_i + one - dx,
            orderType: 'Buy Limit',
            仓位: XXX_state.task参数.size * (i + 1),
        });


        arr.push({
            price: high_i - dx,
            SL: high,
            TP: high_i - one + dx,
            orderType: 'Sell Limit',
            仓位: -XXX_state.task参数.size * (i + 1),
        });
    }

    const list = arr.map(v => ({
        price: Number(v.price.toFixed(8)),
        SL: Number(v.SL.toFixed(8)),
        TP: Number(v.TP.toFixed(8)),
        orderType: v.orderType,
        仓位: Number(v.仓位.toFixed(8)),
    }));

    return {
        low: Number(low.toFixed(8)),
        high: Number(high.toFixed(8)),
        list
    };
}
