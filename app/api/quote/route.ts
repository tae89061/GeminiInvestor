import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    try {
        const yf = new (yahooFinance as any)();
        const quote = await yf.quote(symbol);
        return NextResponse.json(quote);
    } catch (error) {
        console.error('Quote error:', error);
        return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
    }
}
