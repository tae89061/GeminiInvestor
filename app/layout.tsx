import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
    title: 'StockFlow',
    description: 'Real-time investment dashboard',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans bg-background text-white antialiased`}>
                <Navbar />
                {children}
            </body>
        </html>
    )
}
