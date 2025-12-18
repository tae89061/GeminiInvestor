
import yahooFinance from 'yahoo-finance2';

async function testFetch() {
    const symbol = 'AAPL';
    const range = '1y';
    const interval = '1d';

    const now = new Date();
    // 1 year ago
    const period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    console.log(`Fetching ${symbol} from ${period1.toISOString()} to ${now.toISOString()}`);

    // Test 1: Match route.ts style (instantiated)
    try {
        console.log('--- Testing route.ts style ---');
        // This resembles the route.ts usage
        const yf = new (yahooFinance as any)();
        const result = await yf.chart(symbol, {
            period1: period1,
            interval: interval as any,
        }) as any;
        console.log(`Route.ts style: Got ${result?.quotes?.length} quotes`);
        if (result?.quotes?.length > 0) {
            console.log('First:', result.quotes[0].date);
            console.log('Last:', result.quotes[result.quotes.length - 1].date);
        }
    } catch (e) {
        console.log('Route.ts style failed:', e);
    }

    // Test 2: Standard usage (static)
    try {
        console.log('--- Testing standard style ---');
        const result = await yahooFinance.chart(symbol, {
            period1: period1,
            interval: interval as any,
        }) as any;
        console.log(`Standard style: Got ${result?.quotes?.length} quotes`);
        if (result?.quotes?.length > 0) {
            console.log('First:', result.quotes[0].date);
            console.log('Last:', result.quotes[result.quotes.length - 1].date);
        }
    } catch (e) {
        console.log('Standard style failed:', e);
    }
}

testFetch();
