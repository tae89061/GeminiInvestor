"use client";

import useSWR from 'swr';
import { ExternalLink, Calendar } from 'lucide-react';

interface NewsItem {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: number; // Unix timestamp
    type: string;
    relatedTickers?: string[];
}

interface NewsFeedProps {
    symbol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewsFeed({ symbol }: NewsFeedProps) {
    const { data: news, isLoading } = useSWR<NewsItem[]>(
        symbol ? `/api/news?symbol=${symbol}` : null,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">Latest News</h2>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-surface border border-border/50 rounded-xl p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!news || !Array.isArray(news) || news.length === 0) {
        return (
            <div className="text-gray-500 text-sm mt-8">
                No news found for {symbol}.
            </div>
        );
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-6">Latest News</h2>
            <div className="grid gap-4">
                {news.map((item) => (
                    <a
                        key={item.uuid}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-surface border border-border/50 hover:border-primary/50 hover:bg-white/5 rounded-xl p-5 transition-all group"
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-200 group-hover:text-primary transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="font-medium text-gray-400">{item.publisher}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(item.providerPublishTime * 1000).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <ExternalLink size={16} className="text-gray-500 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
