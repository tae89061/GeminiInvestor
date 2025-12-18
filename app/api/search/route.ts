import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const yf = new (yahooFinance as any)(); // Instantiate per error instructions
        const result = await yf.search(query) as any;
        // Filter to only equity and ETF to reduce noise
        const quotes = result.quotes.filter(
            (q: any) => q.isYahooFinance && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
        );
        return NextResponse.json(quotes);
    } catch (error: any) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to search stocks', details: error.message || String(error) }, { status: 500 });
    }
}
