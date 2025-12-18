"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Trash2, Plus, Star } from 'lucide-react';
import useSWR from 'swr';

// Define the structure of a watchlist item
interface WatchlistItem {
    symbol: string;
    price?: number;
    change?: number;
    changePercent?: number;
}

interface WatchlistSidebarProps {
    onSelect: (symbol: string) => void;
    currentSymbol: string;
    className?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WatchlistSidebar({ onSelect, currentSymbol, className = "" }: WatchlistSidebarProps) {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);
    const [newItem, setNewItem] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('gemini_watchlist');
        if (saved) {
            setWatchlist(JSON.parse(saved));
        } else {
            // Default initial watchlist
            setWatchlist(['AAPL', 'NVDA', 'TSLA', 'MSFT']);
        }
    }, []);

    // Save to localStorage whenever watchlist changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('gemini_watchlist', JSON.stringify(watchlist));
            window.dispatchEvent(new Event('watchlist-update'));
        }
    }, [watchlist, mounted]);

    // Listen for external updates
    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('gemini_watchlist');
            if (saved) {
                const newList = JSON.parse(saved);
                setWatchlist(prev => {
                    // Prevent infinite loop by checking if value actually changed
                    if (JSON.stringify(prev) === saved) return prev;
                    return newList;
                });
            }
        };

        window.addEventListener('watchlist-update', handleStorageChange);
        return () => window.removeEventListener('watchlist-update', handleStorageChange);
    }, []);

    // Fetch data for all watched stocks
    // In a real app, we'd might use a bulk endpoint or individual hooks. 
    // For simplicity here, we'll fetch them individually but we can optimize later.
    // Actually, yahoo-finance2 quote can take an array, but our API might not.
    // Let's rely on a helper or just map over them.
    // To keep it simple and clean, let's just render the list and load data for them.

    const removeFromWatchlist = (e: React.MouseEvent, symbol: string) => {
        e.stopPropagation();
        setWatchlist(prev => prev.filter(s => s !== symbol));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem && !watchlist.includes(newItem.toUpperCase())) {
            setWatchlist(prev => [...prev, newItem.toUpperCase()]);
            setNewItem("");
            setIsAdding(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className={`bg-surface border border-border rounded-3xl p-6 h-fit ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Star className="text-primary fill-primary" size={20} />
                    Watchlist
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                    <Plus size={20} />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="mb-4">
                    <input
                        autoFocus
                        type="text"
                        placeholder="Symbol..."
                        className="w-full bg-black/20 border border-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value.toUpperCase())}
                    />
                </form>
            )}

            <div className="space-y-3">
                {watchlist.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <p>Your watchlist is empty.</p>
                        <p className="text-sm">Add stocks to track them here.</p>
                    </div>
                )}

                {watchlist.map(symbol => (
                    <WatchlistItem
                        key={symbol}
                        symbol={symbol}
                        onSelect={onSelect}
                        isActive={currentSymbol === symbol}
                        onRemove={(e) => removeFromWatchlist(e, symbol)}
                    />
                ))}
            </div>
        </div>
    );
}

// Sub-component for individual items to handle their own data fetching
function WatchlistItem({ symbol, onSelect, isActive, onRemove }: {
    symbol: string,
    onSelect: (s: string) => void,
    isActive: boolean,
    onRemove: (e: React.MouseEvent) => void
}) {
    const { data, isLoading } = useSWR(`/api/quote?symbol=${symbol}`, fetcher, { refreshInterval: 30000 });

    const price = data?.regularMarketPrice;
    const change = data?.regularMarketChangePercent;
    const isPositive = change >= 0;

    return (
        <div
            onClick={() => onSelect(symbol)}
            className={`group p-4 rounded-2xl cursor-pointer transition-all border ${isActive
                ? 'bg-white/10 border-primary/50'
                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                }`}
        >
            <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white tracking-wide">{symbol}</span>
                {isLoading ? (
                    <div className="animate-pulse h-4 w-16 bg-gray-700 rounded" />
                ) : (
                    <span className={`text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-primary' : 'text-danger'}`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {change ? `${Math.abs(change).toFixed(2)}%` : '--'}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between">
                {isLoading ? (
                    <div className="animate-pulse h-5 w-20 bg-gray-700 rounded" />
                ) : (
                    <span className="text-lg font-medium text-gray-300">
                        ${price ? price.toFixed(2) : '---'}
                    </span>
                )}

                <button
                    onClick={onRemove}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                    title="Remove from watchlist"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    )
}
