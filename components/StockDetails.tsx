"use client";

import { useState, useEffect } from 'react';
import { Share2, Star, Plus, Loader2, Settings } from 'lucide-react';
import StockChart from './StockChart';
import NewsFeed from './NewsFeed';
import IndicatorSettings, { IndicatorConfig } from './IndicatorSettings';
import useSWR from 'swr';
import { calculateIndicators } from '@/utils/indicators';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StockDetailsProps {
    symbol: string;
}

export default function StockDetails({ symbol }: StockDetailsProps) {
    const [range, setRange] = useState('1mo'); // 1d, 1mo, 1y etc
    const [inWatchlist, setInWatchlist] = useState(false);

    // Indicator Config
    const [showSettings, setShowSettings] = useState(false);
    const [indicatorConfig, setIndicatorConfig] = useState<IndicatorConfig>({
        ema9: true,
        ema20: true,
        macd: true,
        rsi: true
    });

    // Check watchlist status on mount and symbol change
    useEffect(() => {
        const checkWatchlist = () => {
            const saved = localStorage.getItem('gemini_watchlist');
            if (saved) {
                const list = JSON.parse(saved);
                setInWatchlist(list.includes(symbol));
            }
        };

        checkWatchlist();

        // Listen for updates from sidebar
        window.addEventListener('watchlist-update', checkWatchlist);
        return () => window.removeEventListener('watchlist-update', checkWatchlist);
    }, [symbol]);

    const toggleWatchlist = () => {
        const saved = localStorage.getItem('gemini_watchlist');
        let list = saved ? JSON.parse(saved) : [];

        if (inWatchlist) {
            list = list.filter((s: string) => s !== symbol);
        } else {
            list.push(symbol);
        }

        localStorage.setItem('gemini_watchlist', JSON.stringify(list));
        setInWatchlist(!inWatchlist);

        // Notify sidebar
        window.dispatchEvent(new Event('watchlist-update'));
    };

    // Fetch Quote
    const { data: quote, error: quoteError, isLoading: quoteLoading } = useSWR(
        symbol ? `/api/quote?symbol=${symbol}` : null,
        fetcher,
        { refreshInterval: 10000 }
    );

    // Fetch Chart Data
    const { data: rawChartData, error: chartError, isLoading: chartLoading } = useSWR(
        symbol ? `/api/chart?symbol=${symbol}&range=${range}` : null,
        fetcher
    );

    let chartData: any[] | null = null;
    let indicators = null;

    if (rawChartData && !chartError && Array.isArray(rawChartData)) {
        chartData = rawChartData;
        // Calculate indicators
        indicators = calculateIndicators(chartData);
    }

    const isLoading = quoteLoading || chartLoading;

    // Safe Accessors
    const price = quote?.regularMarketPrice;
    const change = quote?.regularMarketChange;
    const changePercent = quote?.regularMarketChangePercent;
    const isPositive = change >= 0;
    const companyName = quote?.longName || symbol;

    if (!symbol) return <div className="text-gray-500">Select a stock</div>;
    if (isLoading && !quote) return (
        <div className="bg-surface border border-border rounded-3xl p-6 lg:p-8 h-[600px] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="bg-surface border border-border rounded-3xl p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl font-bold text-white">
                        {symbol[0]}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{symbol}</h1>
                        <p className="text-gray-400">{companyName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2.5 rounded-full transition-colors ${showSettings ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Settings size={20} />
                    </button>

                    {showSettings && (
                        <IndicatorSettings
                            config={indicatorConfig}
                            onChange={setIndicatorConfig}
                            onClose={() => setShowSettings(false)}
                        />
                    )}

                    <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <Star size={20} />
                    </button>
                    <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={toggleWatchlist}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors ${inWatchlist
                            ? 'bg-surface border border-primary text-primary hover:bg-primary/10'
                            : 'bg-primary hover:bg-primary-hover text-black'
                            }`}
                    >
                        {inWatchlist ? (
                            <>
                                <Star size={18} className="fill-primary" />
                                Unwatch
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Add to Watchlist
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-1 mb-8">
                <div className="flex items-end gap-4">
                    <span className="text-6xl font-bold text-white tracking-tight">
                        {price ? `$${price.toFixed(2)}` : '---'}
                    </span>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium text-sm ${isPositive ? 'bg-primary/20 text-primary' : 'bg-danger/20 text-danger'}`}>
                            {change ? (isPositive ? '+' : '') + change.toFixed(2) : '--'}
                            ({changePercent ? (isPositive ? '+' : '') + changePercent.toFixed(2) : '--'}%)
                        </span>
                        <span className="text-gray-500 text-sm">Today</span>
                    </div>
                </div>

                {/* Extended Hours Display */}
                {((quote?.marketState === 'CLOSED' || quote?.marketState === 'POST') && quote?.postMarketPrice) && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-semibold">Post-Market:</span>
                        <span>${quote.postMarketPrice.toFixed(2)}</span>
                        <span className={`${quote.postMarketChange >= 0 ? 'text-primary' : 'text-danger'}`}>
                            {quote.postMarketChange >= 0 ? '+' : ''}{quote.postMarketChange.toFixed(2)} ({quote.postMarketChangePercent.toFixed(2)}%)
                        </span>
                    </div>
                )}
                {(quote?.marketState === 'PRE' && quote?.preMarketPrice) && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="font-semibold">Pre-Market:</span>
                        <span>${quote.preMarketPrice.toFixed(2)}</span>
                        <span className={`${quote.preMarketChange >= 0 ? 'text-primary' : 'text-danger'}`}>
                            {quote.preMarketChange >= 0 ? '+' : ''}{quote.preMarketChange.toFixed(2)} ({quote.preMarketChangePercent.toFixed(2)}%)
                        </span>
                    </div>
                )}
            </div>

            {/* Timeframe Tabs */}
            <div className="border-b border-border/50 mb-6">
                <div className="flex gap-6 overflow-x-auto">
                    {[
                        { label: '1D', value: '1d' },
                        { label: '5D', value: '5d' },
                        { label: '1M', value: '1mo' },
                        { label: '6M', value: '6mo' },
                        { label: '1Y', value: '1y' },
                        { label: '5Y', value: '5y' }
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setRange(tab.value)}
                            className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${range === tab.value
                                ? 'text-white border-primary'
                                : 'text-gray-500 border-transparent hover:text-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="relative">
                {chartData ? (
                    <StockChart
                        data={chartData}
                        indicators={indicators ? {
                            ema9: indicatorConfig.ema9 ? indicators.ema9 : null,
                            ema20: indicatorConfig.ema20 ? indicators.ema20 : null,
                            macd: indicatorConfig.macd ? indicators.macd : null,
                            rsi: indicatorConfig.rsi ? indicators.rsi : null,
                        } : null}
                        colors={!isPositive ? {
                            backgroundColor: 'transparent',
                            lineColor: '#ef4444',
                            textColor: '#71717a',
                            areaTopColor: 'rgba(239, 68, 68, 0.3)',
                            areaBottomColor: 'rgba(239, 68, 68, 0.0)',
                        } : undefined}
                    />
                ) : (
                    <div className="h-[600px] flex items-center justify-center text-gray-500">
                        {chartError ? 'Failed to load chart' : 'Loading chart...'}
                    </div>
                )}
            </div>

            <NewsFeed symbol={symbol} />
        </div>
    );
}
