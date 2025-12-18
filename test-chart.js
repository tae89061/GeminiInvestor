const yahooFinance = require('yahoo-finance2').default;

async function test() {
    try {
        const yf = new yahooFinance();
        const symbol = 'AAPL';

        // valid options: period1 (required), interval
        const period1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const queryOptions = { period1: period1, interval: '1d' };

        console.log('Testing with options:', queryOptions);
        const result = await yf.chart(symbol, queryOptions);
        console.log('Success!', result.meta.symbol);
    } catch (e) {
        console.error('Error:', e.message);
        if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
    }
}

test();
