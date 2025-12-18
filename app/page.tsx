"use client";

import { useState } from "react";
import StockDetails from "@/components/StockDetails";
import SearchBar from "@/components/SearchBar";
import MarketOverview from "@/components/MarketOverview";
import WatchlistSidebar from "@/components/WatchlistSidebar";

export default function Home() {
    const [symbol, setSymbol] = useState("AAPL");

    return (
        <main className="container mx-auto px-4 py-8 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    <SearchBar onSelect={setSymbol} />

                    {/* Stock Details & Chart */}
                    <StockDetails symbol={symbol} />
                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <WatchlistSidebar
                        onSelect={setSymbol}
                        currentSymbol={symbol}
                    />
                    <MarketOverview />
                </div>
            </div>
        </main>
    )
}
