import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        // Fetch news using the search endpoint which often returns news items
        // Or if available, use a more specific news method if the library supports it.
        // For yahoo-finance2, 'search' with newsCount is a common way to get news for a query.
        const result: any = await yahooFinance.search(symbol, { newsCount: 5 });

        // Filter for news items
        const news = result.news || [];

        return NextResponse.json(news);
    } catch (error: any) {
        console.error("News fetch error:", error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
