import { EMA, MACD, RSI } from 'technicalindicators';

export interface ChartDataPoints {
    time: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export function calculateIndicators(data: ChartDataPoints[]) {
    const closePrices = data.map((d) => d.close);

    // EMA
    const ema9 = EMA.calculate({ period: 9, values: closePrices });
    const ema20 = EMA.calculate({ period: 20, values: closePrices });

    // RSI
    const rsi = RSI.calculate({ period: 14, values: closePrices });

    // MACD
    const macd = MACD.calculate({
        values: closePrices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    });

    // Align data
    // Indicators remove initial periods. We need to align the output 'time' with the computed values.

    // Create a combined dataset. 
    // Note: EMA9 starts at index 8 (9th point), EMA20 at 19, RSI at 14, MACD at 25 (26-1) usually.

    // We'll map the original data to include these fields, filling null/undefined where not available.
    const extendedData = data.map((d, index) => {
        // Offset calculations
        // technicalindicators results are shorter than input.
        // e.g. if input len 100, ema9 len 92. 
        // ema9[0] corresponds to input[8].

        const ema9Offset = 9 - 1;
        const ema20Offset = 20 - 1;
        const rsiOffset = 14;
        const macdOffset = 25; // approximations, need to be careful.

        // Better way: Align from the end? Or just use known offsets.
        // Library documentation says result length = input length - period + 1 for simple MAs usually.

        // Let's use specific logic for alignment.
        // EMA/SMA: array[0] matches input[period-1]

        const ema9Val = index >= 8 ? ema9[index - 8] : undefined;
        const ema20Val = index >= 19 ? ema20[index - 19] : undefined;
        const rsiVal = index >= 14 ? rsi[index - 14] : undefined;

        // MACD results structure: { MACD, signal, histogram }
        // MACD length depends on slow period usually.
        // library says: results.length = values.length - slowPeriod + 1?
        // Let's just create separate arrays aligned by time for the chart to consume safely.

        return {
            ...d,
            ema9: ema9Val,
            ema20: ema20Val,
            rsi: rsiVal,
        };
    });

    // MACD alignment logic is trickier, let's just return the raw arrays and let the component align by stripping the start of the time array.

    return {
        ema9: alignSeries(data, ema9, 9 - 1),
        ema20: alignSeries(data, ema20, 20 - 1),
        rsi: alignSeries(data, rsi, 14),
        macd: alignMacd(data, macd, 26 - 1), // slow period determines start
    };
}

function alignSeries(data: ChartDataPoints[], values: number[], offset: number) {
    // Returns objects { time, value }
    return values.map((val, i) => ({
        time: data[i + offset].time,
        value: val,
    }));
}

function alignMacd(data: ChartDataPoints[], values: any[], offset: number) {
    return values.map((val, i) => ({
        time: data[i + offset].time,
        ...val,
    }));
}
