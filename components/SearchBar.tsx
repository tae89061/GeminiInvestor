"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SearchBarProps {
    onSelect?: (symbol: string) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: results, error } = useSWR(
        query.length > 1 ? `/api/search?q=${query}` : null,
        fetcher
    );

    const handleSelect = (symbol: string) => {
        if (onSelect) onSelect(symbol);
        setQuery('');
        setIsOpen(false);
    };

    // Close click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-4" ref={containerRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-32 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-lg shadow-black/50"
                    placeholder="Search stocks by name or symbol..."
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                        <Sparkles size={12} />
                        AI Powered
                    </span>
                </div>

                {/* Results Dropdown */}
                {isOpen && query.length > 1 && results && !results.error && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No results found</div>
                        ) : (
                            results.map((result: any) => (
                                <button
                                    key={result.symbol}
                                    onClick={() => handleSelect(result.symbol)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors text-left border-b border-border/50 last:border-0"
                                >
                                    <div>
                                        <span className="font-bold text-white block">{result.symbol}</span>
                                        <span className="text-sm text-gray-400 truncate max-w-[200px] block">{result.shortname || result.longname}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 uppercase border border-gray-700 px-1.5 py-0.5 rounded">{result.exchange}</span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Popular Tags */}
            <div className="flex items-center gap-3 text-sm overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-gray-500 whitespace-nowrap">Popular:</span>
                {['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META'].map((ticker) => (
                    <button
                        key={ticker}
                        onClick={() => onSelect && onSelect(ticker)}
                        className="px-3 py-1 rounded-full bg-surface border border-border hover:border-primary/50 hover:text-primary text-gray-400 transition-colors"
                    >
                        {ticker}
                    </button>
                ))}
            </div>
        </div>
    );
}
