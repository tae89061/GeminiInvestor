"use client";

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, Time, AreaSeries, LineSeries, HistogramSeries, CandlestickSeries } from 'lightweight-charts';

interface ChartProps {
    data: any[];
    indicators?: any;
    colors?: any;
}

export default function StockChart({
    data,
    indicators,
    colors = {
        backgroundColor: 'transparent',
        lineColor: '#22c55e',
        textColor: '#71717a',
        areaTopColor: 'rgba(34, 197, 94, 0.3)',
        areaBottomColor: 'rgba(34, 197, 94, 0.0)',
    }
}: ChartProps) {

    const mainChartContainerRef = useRef<HTMLDivElement>(null);
    const rsiChartContainerRef = useRef<HTMLDivElement>(null);
    const macdChartContainerRef = useRef<HTMLDivElement>(null);

    const mainChartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const macdChartRef = useRef<IChartApi | null>(null);

    // Synchronize Charts
    useEffect(() => {
        // TODO: Implement advanced sync if needed. 
        // For now, let's render them stacked. synchronization requires managing visible logic.
        // lightweight-charts doesn't have built-in sync across instances out of the box easily without event listeners.
        // We will focus on rendering first.
    }, []);

    useEffect(() => {
        if (!mainChartContainerRef.current) return;

        // --- Main Chart (Price + Volume + EMA) ---
        const mainChart = createChart(mainChartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: colors.backgroundColor }, textColor: colors.textColor },
            width: mainChartContainerRef.current.clientWidth,
            height: 400,
            grid: { vertLines: { visible: false }, horzLines: { color: '#27272a', style: 1 } },
            rightPriceScale: { borderVisible: false },
            timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
            handleScroll: {
                vertTouchDrag: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
            },
        });
        mainChartRef.current = mainChart;

        // Candlestick Series (Price)
        const candlestickSeries = mainChart.addSeries(CandlestickSeries, {
            upColor: '#22c55e', downColor: '#ef4444', borderVisible: false, wickUpColor: '#22c55e', wickDownColor: '#ef4444',
        });
        candlestickSeries.setData(data.map((d: any) => ({
            time: d.time, open: d.open, high: d.high, low: d.low, close: d.close
        })) as any);

        // Volume Series (Overlay)
        const volumeSeries = mainChart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume', // Separate scale
            color: '#26a69a',
        });

        mainChart.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.7, bottom: 0 },
        });
        volumeSeries.setData(data.map((d: any) => ({
            time: d.time, value: d.volume, color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
        })) as any);

        // EMAs
        if (indicators?.ema9) {
            const ema9Series = mainChart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, title: 'EMA 9' });
            ema9Series.setData(indicators.ema9 as any);
        }
        if (indicators?.ema20) {
            const ema20Series = mainChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: 'EMA 20' });
            ema20Series.setData(indicators.ema20 as any);
        }

        // --- MACD Chart ---
        let macdChart: IChartApi | null = null;
        if (macdChartContainerRef.current && indicators?.macd) {
            macdChart = createChart(macdChartContainerRef.current, {
                layout: { background: { type: ColorType.Solid, color: colors.backgroundColor }, textColor: colors.textColor },
                width: macdChartContainerRef.current.clientWidth,
                height: 150,
                grid: { vertLines: { visible: false }, horzLines: { color: '#27272a', style: 1 } },
                rightPriceScale: { borderVisible: false },
                timeScale: { visible: false },
            });
            macdChartRef.current = macdChart;

            const macdSeries = macdChart.addSeries(LineSeries, { color: '#2962ff', lineWidth: 1 });
            const signalSeries = macdChart.addSeries(LineSeries, { color: '#ff6d00', lineWidth: 1 });
            const histogramSeries = macdChart.addSeries(HistogramSeries, { color: '#26a69a' });

            macdSeries.setData(indicators.macd.map((d: any) => ({ time: d.time, value: d.MACD })));
            signalSeries.setData(indicators.macd.map((d: any) => ({ time: d.time, value: d.signal })));
            histogramSeries.setData(indicators.macd.map((d: any) => ({
                time: d.time, value: d.histogram, color: d.histogram >= 0 ? '#26a69a' : '#ef5350'
            })));
        }

        // --- RSI Chart ---
        let rsiChart: IChartApi | null = null;
        if (rsiChartContainerRef.current && indicators?.rsi) {
            rsiChart = createChart(rsiChartContainerRef.current, {
                layout: { background: { type: ColorType.Solid, color: colors.backgroundColor }, textColor: colors.textColor },
                width: rsiChartContainerRef.current.clientWidth,
                height: 150,
                grid: { vertLines: { visible: false }, horzLines: { color: '#27272a', style: 1 } },
                rightPriceScale: { borderVisible: false },
                timeScale: { visible: true },
            });
            rsiChartRef.current = rsiChart;

            const rsiSeries = rsiChart.addSeries(LineSeries, { color: '#7e57c2', lineWidth: 1 });
            rsiSeries.setData(indicators.rsi as any);

            // Add RSI Levels
            // lightweight-charts doesn't support 'horizontal lines' easily other than grid lines or creating a line series.
            // We can create constant line series for 70/30.
            const upperLevel = rsiChart.addSeries(LineSeries, { color: '#9ca3af', lineWidth: 1, lineStyle: 2 });
            const lowerLevel = rsiChart.addSeries(LineSeries, { color: '#9ca3af', lineWidth: 1, lineStyle: 2 });

            upperLevel.setData(indicators.rsi.map((d: any) => ({ time: d.time, value: 70 })));
            lowerLevel.setData(indicators.rsi.map((d: any) => ({ time: d.time, value: 30 })));
        }

        // Handle Resize
        const handleResize = () => {
            if (mainChartContainerRef.current && mainChart) {
                mainChart.applyOptions({ width: mainChartContainerRef.current.clientWidth });
            }
            if (macdChartContainerRef.current && macdChart) {
                macdChart.applyOptions({ width: macdChartContainerRef.current.clientWidth });
            }
            if (rsiChartContainerRef.current && rsiChart) {
                rsiChart.applyOptions({ width: rsiChartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        // Sync Time Scales (Basic)
        // To do this properly requires subscribing to visibleLogicalRangeChange and setting it on others.
        const charts = [mainChart, macdChart, rsiChart].filter(Boolean) as IChartApi[];

        charts.forEach(c => {
            c.timeScale().subscribeVisibleLogicalRangeChange(range => {
                if (range) {
                    charts.forEach(other => {
                        if (other !== c) {
                            other.timeScale().setVisibleLogicalRange(range);
                        }
                    });
                }
            });
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            mainChart.remove();
            macdChart?.remove();
            rsiChart?.remove();
        };
    }, [data, indicators, colors]);

    return (
        <div className="flex flex-col gap-1 w-full">
            {/* Main Chart */}
            <div ref={mainChartContainerRef} className="w-full h-[400px]" />

            {/* MACD */}
            {indicators?.macd && (
                <div className="w-full relative">
                    <div className="absolute top-1 left-2 text-xs font-semibold text-gray-500 z-10">MACD (12, 26, 9)</div>
                    <div ref={macdChartContainerRef} className="w-full h-[150px]" />
                </div>
            )}

            {/* RSI */}
            {indicators?.rsi && (
                <div className="w-full relative">
                    <div className="absolute top-1 left-2 text-xs font-semibold text-gray-500 z-10">RSI (14)</div>
                    <div ref={rsiChartContainerRef} className="w-full h-[150px]" />
                </div>
            )}
        </div>
    );
}
