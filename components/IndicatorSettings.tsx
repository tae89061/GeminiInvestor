"use client";

import { X } from 'lucide-react';

export interface IndicatorConfig {
    ema9: boolean;
    ema20: boolean;
    macd: boolean;
    rsi: boolean;
}

interface IndicatorSettingsProps {
    config: IndicatorConfig;
    onChange: (config: IndicatorConfig) => void;
    onClose: () => void;
}

export default function IndicatorSettings({ config, onChange, onClose }: IndicatorSettingsProps) {
    const toggle = (key: keyof IndicatorConfig) => {
        onChange({ ...config, [key]: !config[key] });
    };

    return (
        <div className="absolute top-12 right-0 bg-surface border border-border shadow-xl rounded-xl p-4 w-64 z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Chart Indicators</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="space-y-3">
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overlays</h4>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.ema9 ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-gray-500'}`}>
                            {config.ema9 && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors">EMA 9</span>
                        <input type="checkbox" className="hidden" checked={config.ema9} onChange={() => toggle('ema9')} />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.ema20 ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-gray-500'}`}>
                            {config.ema20 && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors">EMA 20</span>
                        <input type="checkbox" className="hidden" checked={config.ema20} onChange={() => toggle('ema20')} />
                    </label>
                </div>

                <div className="h-px bg-border/50 my-2" />

                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Oscillators</h4>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.macd ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-gray-500'}`}>
                            {config.macd && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors">MACD</span>
                        <input type="checkbox" className="hidden" checked={config.macd} onChange={() => toggle('macd')} />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.rsi ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-gray-500'}`}>
                            {config.rsi && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors">RSI</span>
                        <input type="checkbox" className="hidden" checked={config.rsi} onChange={() => toggle('rsi')} />
                    </label>
                </div>
            </div>
        </div>
    );
}
