import React from 'react';
import { Info, Scale, Target, Zap } from 'lucide-react';

export const LogicExplorer: React.FC = () => {
    const weights = [
        { id: 'integrity', label: 'Veri Bütünlüğü', weight: 30, desc: 'Liste verilerinin kendi içinde tutarlı ve özgün olup olmadığını doğrular.' },
        { id: 'market', label: 'Pazar Olasılığı', weight: 20, desc: 'Fiyatlandırma ve özellikleri küresel pazar normlarına göre karşılaştırır.' },
        { id: 'pressure', label: 'Davranışsal Baskı', weight: 15, desc: 'Psikolojik manipülasyon ve yapay aciliyet tespit eder.' },
        { id: 'completeness', label: 'Liste Kalitesi', weight: 15, desc: 'Ürün detaylarının derinliğini ve profesyonelliğini denetler.' },
        { id: 'consensus', label: 'Uzlaşma Varyansı', weight: 20, desc: 'Bağımsız ajanlar arasındaki anlaşma seviyelerini ölçer.' },
    ];

    const thresholds = [
        { label: 'GÜVENLİ', range: '80 - 100', color: 'bg-tertiary-fixed-dim', text: 'Özgün liste olma olasılığı yüksek. Kırmızı bayrak tespit edilmedi.' },
        { label: 'DOĞRULA', range: '40 - 79', color: 'bg-primary/60', text: 'Belirsiz sinyaller. Manuel doğrulama veya dikkat önerilir.' },
        { label: 'KAÇIN', range: '0 - 39', color: 'bg-error', text: 'Manipülasyon veya sahtekarlık faaliyeti riski yüksek.' },
    ];

    return (
        <div className="flex-1 p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="border-b border-outline-variant pb-8">
                    <div className="text-label-caps font-label-caps text-primary mb-2">MANTIK GEZGİNİ V1</div>
                    <h1 className="text-4xl font-headline-md text-on-surface tracking-tight">Olasılıksal Karar Mantığı</h1>
                    <p className="text-body-md text-on-surface-variant mt-4 max-w-2xl">
                        Uzlaşma tabanlı motorumuz bağımsız ajan sinyallerini çok boyutlu hipotez alanına eşler.
                        Kararlar ikili değildir; kalibre edilmiş olasılık dağılımlarıdır.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Weights Section */}
                    <div className="md:col-span-7 space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Scale size={20} />
                            <div className="text-label-caps font-label-caps font-bold">AJAN AĞIRLIK DAĞILIMI</div>
                        </div>

                        <div className="bg-surface-container-low border border-outline-variant p-6 space-y-8">
                            {weights.map((w) => (
                                <div key={w.id} className="space-y-2">
                                    <div className="flex justify-between items-baseline">
                                        <div className="text-on-surface font-label-caps text-sm">{w.label}</div>
                                        <div className="text-primary font-data-mono">{w.weight}%</div>
                                    </div>
                                    <div className="h-1.5 w-full bg-outline-variant/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${w.weight}%` }}></div>
                                    </div>
                                    <div className="text-[11px] text-on-surface-variant opacity-70 italic leading-tight">
                                        {w.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Thresholds Section */}
                    <div className="md:col-span-5 space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Target size={20} />
                            <div className="text-label-caps font-label-caps font-bold">KARAR EŞİKLERİ</div>
                        </div>

                        <div className="space-y-4">
                            {thresholds.map((t) => (
                                <div key={t.label} className="border border-outline-variant bg-surface-container-low p-4 relative overflow-hidden group">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.color}`}></div>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-label-caps font-label-caps font-bold text-on-surface">{t.label}</div>
                                        <div className="text-xs font-data-mono opacity-60">{t.range}</div>
                                    </div>
                                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                                        {t.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Technical Note */}
                        <div className="p-4 bg-primary/5 border border-primary/20 flex gap-4 items-start">
                            <Info size={16} className="text-primary mt-0.5 shrink-0" />
                            <p className="text-[10px] text-on-surface-variant leading-relaxed">
                                <strong>Teknik Not:</strong> Skorlar "Sıfır Güven" taban çizgisinden ağırlıklı Öklid uzaklığı kullanılarak hesaplanır, epistemik belirsizlik vektörleri ile ayarlanır.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Agent Consensus Visual */}
                <div className="border border-outline-variant bg-surface-container-low p-8">
                    <div className="flex items-center gap-3 text-primary mb-8">
                        <Zap size={20} />
                        <div className="text-label-caps font-label-caps font-bold">UZLAŞMA KAPISI MİMARİSİ</div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 opacity-80">
                        <div className="p-4 border border-outline-variant bg-surface text-center min-w-[140px]">
                            <div className="text-[10px] font-label-caps text-on-surface-variant mb-1">BAĞIMSIZ</div>
                            <div className="text-sm font-bold text-on-surface">5 AJAN</div>
                        </div>
                        <div className="text-primary text-2xl">→</div>
                        <div className="p-4 border border-primary/40 bg-primary/5 text-center min-w-[200px] relative">
                            <div className="text-[10px] font-label-caps text-primary mb-1">OLASILIKSAL</div>
                            <div className="text-sm font-bold text-on-surface">UZLAŞMA KAPISI</div>
                            <div className="absolute inset-0 uncertainty-pattern opacity-10"></div>
                        </div>
                        <div className="text-primary text-2xl">→</div>
                        <div className="p-4 border border-outline-variant bg-surface text-center min-w-[140px]">
                            <div className="text-[10px] font-label-caps text-on-surface-variant mb-1">SON</div>
                            <div className="text-sm font-bold text-on-surface">KARAR</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
