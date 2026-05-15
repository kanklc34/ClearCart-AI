import React from 'react';
import { ShieldAlert, ShieldCheck, Fingerprint, Activity, BarChart3 } from 'lucide-react';

interface EvidenceItem {
    type: string;
    dimension: string;
    message: string;
    impact: number;
}

interface RiskMatricesTabProps {
    evidenceLog: EvidenceItem[];
    consensusFactors?: {
        coverage?: number;
        evidence_density?: number;
        uncertainty?: number;
        correlation_risk?: number;
    };
}

export const RiskMatricesTab: React.FC<RiskMatricesTabProps> = ({ 
    evidenceLog, 
    consensusFactors 
}) => {
    const sortedEvidence = [...evidenceLog].sort((a, b) => a.impact - b.impact);
    
    return (
        <div className="flex-1 p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="border-b border-outline-variant pb-8">
                    <div className="text-label-caps font-label-caps text-primary mb-2">RİSK_MATRİSLERİ_V1</div>
                    <h1 className="text-4xl font-headline-md text-on-surface tracking-tight">Kanıt Hipotez Alanı</h1>
                    <p className="text-body-md text-on-surface-variant mt-4 max-w-2xl">
                        Tüm sinyal-kanıt eşlemelerinin ayrıntılı dökümü. Pozitif etki sinyalleri "Güvenilir" hipotezini güçlendirirken, negatif etkiler "Risk" olasılığını artırır.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Metrics and Stats */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Activity size={20} />
                            <div className="text-label-caps font-label-caps font-bold">İSTİKRAR_METRİKLERİ</div>
                        </div>

                        <div className="bg-surface-container-low border border-outline-variant p-6 space-y-6 relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <div className="space-y-6 flex-1">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[11px] font-label-caps text-on-surface-variant opacity-60">KANIT_YOĞUNLUĞU</span>
                                            <span className="text-xl font-data-mono text-primary">{(consensusFactors?.evidence_density || 0.4).toFixed(2)}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${(consensusFactors?.evidence_density || 0.4) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[11px] font-label-caps text-on-surface-variant opacity-60">KORELASYON_RİSKİ</span>
                                            <span className="text-xl font-data-mono text-error">{(consensusFactors?.correlation_risk || 0.1).toFixed(2)}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-error" style={{ width: `${(consensusFactors?.correlation_risk || 0.1) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Consensus Gauge */}
                                <div className="ml-8 flex flex-col items-center">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path
                                                className="text-outline-variant/20 stroke-current"
                                                strokeWidth="3"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className="text-primary stroke-current"
                                                strokeWidth="3"
                                                strokeDasharray={`${(1 - (consensusFactors?.uncertainty || 0.2)) * 100}, 100`}
                                                strokeLinecap="square"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-lg font-data-mono text-primary">
                                                {Math.round((1 - (consensusFactors?.uncertainty || 0.2)) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-label-caps text-on-surface-variant opacity-50 mt-2">KONSENSÜS_İSTİKRARI</div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-outline-variant/30 flex justify-between">
                                <div className="text-center">
                                    <div className="text-[10px] font-label-caps text-on-surface-variant opacity-60">POZİTİF_SİNYAL</div>
                                    <div className="text-2xl font-data-mono text-tertiary-fixed-dim">
                                        {evidenceLog.filter(e => e.impact > 0).length}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-label-caps text-on-surface-variant opacity-60">NEGATİF_SİNYAL</div>
                                    <div className="text-2xl font-data-mono text-error">
                                        {evidenceLog.filter(e => e.impact < 0).length}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-tertiary/5 border border-tertiary/20 flex gap-4 items-start">
                            <BarChart3 size={16} className="text-tertiary mt-0.5 shrink-0" />
                            <p className="text-[10px] text-on-surface-variant leading-relaxed italic">
                                <strong>Konsensüs Notu:</strong> Ajan mutabakatı şu an şu seviyededir: 
                                <span className="text-primary font-bold ml-1">
                                    {(1 - (consensusFactors?.uncertainty || 0.2) > 0.7) ? "YÜKSEK" : "ORTA"}
                                </span>.
                                Birden fazla bağımsız ajan ana sinyalleri çapraz doğrulamıştır.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Evidence Table */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Fingerprint size={20} />
                            <div className="text-label-caps font-label-caps font-bold">KANIT_HİPOTEZ_HARİTASI</div>
                        </div>

                        <div className="bg-surface-container-low border border-outline-variant rounded-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface text-[10px] font-label-caps text-on-surface-variant/60 border-b border-outline-variant">
                                        <th className="px-4 py-3 font-bold">TÜR</th>
                                        <th className="px-4 py-3 font-bold">BOYUT</th>
                                        <th className="px-4 py-3 font-bold">GÖZLEMLENEN_KANIT</th>
                                        <th className="px-4 py-3 font-bold text-right">ETKİ</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] font-data-mono divide-y divide-outline-variant/30">
                                    {sortedEvidence.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-20 text-center text-on-surface-variant opacity-30 italic">
                                                DENETİM_KANITI_KAYDEDİLMEDİ
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedEvidence.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${item.impact > 0 ? 'border-tertiary/20 text-tertiary' : 'border-error/20 text-error'} bg-surface`}>
                                                        {item.impact > 0 ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                                                        <span className="text-[9px] uppercase">{item.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-on-surface-variant uppercase text-[10px]">
                                                    {item.dimension}
                                                </td>
                                                <td className="px-4 py-3 text-on-surface group-hover:text-primary transition-colors leading-relaxed">
                                                    {item.message}
                                                </td>
                                                <td className={`px-4 py-3 text-right font-bold ${item.impact > 0 ? 'text-tertiary' : 'text-error'}`}>
                                                    {item.impact > 0 ? '+' : ''}{item.impact}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
