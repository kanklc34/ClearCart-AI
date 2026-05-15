import React, { useState } from 'react';

interface Signal {
    label: string;
    confidence: number;
}

interface DecisionLogicProps {
    strongestSignals: Signal[];
    uncertaintyDrivers: string[];
    anomalies: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawAudit?: any;
}

export const DecisionLogic: React.FC<DecisionLogicProps> = ({
    strongestSignals,
    uncertaintyDrivers,
    anomalies,
    rawAudit,
}) => {
    const [view, setView] = useState<'LOGIC' | 'RAW'>('LOGIC');

    return (
        <div className="w-full border border-outline-variant bg-surface-container-low flex flex-col">
            {/* Header Tabs */}
            <div className="p-3 border-b border-outline-variant text-label-caps font-label-caps text-primary bg-surface flex gap-6">
                <span
                    className={`cursor-pointer transition-all ${view === 'LOGIC' ? 'opacity-100 border-b border-primary pb-1' : 'opacity-40 hover:opacity-60'}`}
                    onClick={() => setView('LOGIC')}
                >
                    KARAR_MANTIĞI
                </span>
                <span
                    className={`cursor-pointer transition-all ${view === 'RAW' ? 'opacity-100 border-b border-primary pb-1' : 'opacity-40 hover:opacity-60'}`}
                    onClick={() => setView('RAW')}
                >
                    HAM_VERİ_DÖKÜMÜ
                </span>
            </div>

            {view === 'LOGIC' ? (
                /* ── 3 kolon grid: Signals | Drivers | Anomalies ── */
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant">

                    {/* Kolon 1: Strongest Signals */}
                    <div className="p-5 flex flex-col gap-4">
                        <h4 className="text-label-caps font-label-caps text-on-surface-variant">
                            EN_GÜÇLÜ_SİNYALLER
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {strongestSignals.length > 0 ? (
                                strongestSignals.slice(0, 3).map((signal, idx) => (
                                    <li key={idx} className="flex justify-between items-center border border-outline-variant p-2 bg-surface hover:bg-surface-container-high transition-colors">
                                        <span className="text-body-sm font-body-sm text-primary uppercase truncate flex-1 pr-2">
                                            {signal.label}
                                        </span>
                                        <span className="text-label-caps font-label-caps text-tertiary-fixed-dim shrink-0">
                                            {(signal.confidence * 100).toFixed(0)}%
                                        </span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-body-sm font-body-sm text-on-surface-variant opacity-50">
                                    Sinyal algılanmadı
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Kolon 2: Uncertainty Drivers */}
                    <div className="p-5 flex flex-col gap-4">
                        <h4 className="text-label-caps font-label-caps text-on-surface-variant flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-error block shrink-0"></span>
                            BELİRSİZLİK_ETKENLERİ
                        </h4>
                        <div className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed flex flex-col gap-2">
                            {uncertaintyDrivers.length > 0 ? (
                                uncertaintyDrivers.slice(0, 5).map((driver, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="text-on-surface-variant opacity-40 shrink-0">&gt;</span>
                                        <span>{driver}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="opacity-50">&gt; Belirsizlik faktörü algılanmadı</div>
                            )}
                        </div>
                    </div>

                    {/* Kolon 3: Isolated Anomalies */}
                    <div className="p-5 flex flex-col gap-4">
                        <h4 className="text-label-caps font-label-caps text-on-surface-variant">
                            İZOLE_ANOMALİLER
                        </h4>
                        {anomalies.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {anomalies.slice(0, 4).map((anomaly, idx) => (
                                    <div key={idx} className="border border-error/40 p-3 bg-error/5">
                                        <span className="text-body-sm font-body-sm text-error leading-relaxed break-words">
                                            ⚠ {anomaly}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-body-sm font-body-sm text-on-surface-variant opacity-50">
                                Önemli bir anomali algılanmadı
                            </div>
                        )}
                    </div>

                </div>
            ) : (
                <div className="p-5 font-data-mono text-[10px] bg-surface overflow-auto max-h-[500px]">
                    <pre className="text-primary/80 leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(rawAudit, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};