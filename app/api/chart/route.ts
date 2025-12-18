import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const range = searchParams.get('range') || '1mo'; // 1d, 5d, 1mo, 6mo, 1y, 5y, max

    let interval = searchParams.get('interval');

    // Determine interval if not provided
    if (!interval) {
        switch (range) {
            case '1d': interval = '5m'; break;
            case '5d': interval = '15m'; break;
            case '1mo': interval = '60m'; break;
            case '3mo':
            case '6mo':
            case '1y':
            case '5y': interval = '1d'; break;
            case 'max': interval = '1wk'; break;
            default: interval = '1d';
        }
    }

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    try {
        // Calculate period1 based on range
        const now = new Date();
        let period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default 1mo

        switch (range) {
            case '1d': period1 = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
            case '5d': period1 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); break;
            case '1mo': period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
            case '3mo': period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
            case '6mo': period1 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000); break;
            case '1y': period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
            case '5y': period1 = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000); break;
            case 'max': period1 = new Date(0); break; // 1970
        }

        const yf = new (yahooFinance as any)();
        const result = await yf.chart(symbol, {
            interval: interval as any,
            period1: period1,
        }) as any;

        const chartData = result.quotes.map((q: any) => ({
            time: Math.floor(new Date(q.date).getTime() / 1000),
            open: q.open,
            high: q.high,
            low: q.low,
            close: q.close,
            volume: q.volume,
        })).filter((d: any) => d.close !== null && d.close !== undefined);

        return NextResponse.json(chartData);
    } catch (error: any) {
        console.error('Chart error:', error);
        return NextResponse.json({ error: 'Failed to fetch chart data', details: error.message || String(error) }, { status: 500 });
    }
}
