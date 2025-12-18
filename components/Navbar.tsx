import { Bell, Settings, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">StockFlow</span>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                        <Link href="/" className="text-white hover:text-primary transition-colors">
                            Dashboard
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Markets
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            Portfolio
                        </Link>
                        <Link href="#" className="hover:text-white transition-colors">
                            News
                        </Link>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="p-2 hover:bg-surface hover:text-white rounded-full transition-colors">
                        <Bell size={20} />
                    </button>
                    <button className="p-2 hover:bg-surface hover:text-white rounded-full transition-colors">
                        <Settings size={20} />
                    </button>
                    <button className="p-2 hover:bg-surface hover:text-white rounded-full transition-colors">
                        <User size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
