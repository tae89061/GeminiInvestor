"use client";

import { ArrowUpRight, ArrowDownRight, Plus, Loader2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Indices = [
    { name: 'S&P 500', symbol: '^GSPC' },
    { name: 'NASDAQ', symbol: '^IXIC' },
    { name: 'DOW 30', symbol: '^DJI' },
    { name: 'Russell 2000', symbol: '^RUT' },
];

const MarketCard = ({ name, symbol }: { name: string, symbol: string }) => {
    const { data: quote, isLoading } = useSWR(`/api/quote?symbol=${encodeURIComponent(symbol)}`, fetcher, { refreshInterval: 30000 });

    if (isLoading || !quote) return (
        <div className="p-4 rounded-xl bg-surface border border-border/50 animate-pulse h-24"></div>
    );

    const price = quote.regularMarketPrice;
    const change = quote.regularMarketChange;
    const changePercent = quote.regularMarketChangePercent;
    const isPositive = change >= 0;

    return (
        <div className="p-4 rounded-xl bg-surface border border-border/50 hover:border-border transition-colors group">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-200 group-hover:text-white transition-colors">{name}</h3>
                <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-primary' : 'text-danger'}`}>
                    {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {Math.abs(changePercent).toFixed(2)}%
                </span>
            </div>
            <p className="text-2xl font-bold text-white">
                {price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
        </div>
    );
};

export default function MarketOverview() {
    return (
        <div className="space-y-6">
            {/* Market Indices */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Market Overview</h2>
                <div className="space-y-3">
                    {Indices.map((index) => (
                        <MarketCard key={index.symbol} {...index} />
                    ))}
                </div>
            </div>

            {/* Watchlist Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Watchlist</h2>
                    <button className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium">
                        <Plus size={16} /> Add
                    </button>
                </div>
                <div className="p-8 rounded-xl bg-surface border border-border/50 border-dashed flex items-center justify-center text-gray-500 text-sm">
                    No stocks saved yet
                </div>
            </div>
        </div>
    );
}
