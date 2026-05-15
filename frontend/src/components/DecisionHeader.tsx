import React from 'react';

interface DecisionHeaderProps {
    recommendation: 'SAFE' | 'VERIFY' | 'AVOID';
    globalScore: number;
    confidence: number;
    summary?: string;
}

const recommendationMap = {
    'SAFE': { label: 'Denetim Sonucu: GÜVENLİ', color: 'text-tertiary-fixed-dim' },
    'VERIFY': { label: 'Denetim Sonucu: DOĞRULA', color: 'text-tertiary-fixed-dim' },
    'AVOID': { label: 'Denetim Sonucu: KAÇIN', color: 'text-error' },
};

const getConfidenceLevel = (conf: number) => {
    if (conf >= 0.8) return 'YÜKSEK GÜVEN';
    if (conf >= 0.6) return 'NORMAL GÜVEN';
    if (conf >= 0.4) return 'SINIRLI GÜVEN';
    return 'BELİRSİZ';
};

export const DecisionHeader: React.FC<DecisionHeaderProps> = ({
    recommendation,
    globalScore,
    confidence,
    summary,
}) => {
    const confLevel = getConfidenceLevel(confidence);
    const recMap = recommendationMap[recommendation];
    const uncertaintyColor = confidence < 0.6 ? 'text-tertiary' : 'text-primary';

    return (
        <div className="w-full border border-outline-variant bg-surface-container-low flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-outline-variant">
            {/* Recommendation */}
            <div className="flex-1 p-4 md:p-8 relative overflow-hidden group min-w-0 md:min-w-[400px]">
                <div className="text-[10px] font-label-caps text-on-surface-variant mb-3 opacity-60 tracking-[0.2em]">
                    DENETİM SONUCU
                </div>
                <div className={`text-3xl font-headline-md ${recMap.color} uppercase tracking-tight relative z-10 mb-4`}>
                    {recMap.label}
                </div>

                {summary && (
                    <p className="text-body-sm font-body-sm text-on-surface-variant max-w-xl leading-relaxed relative z-10 animate-in fade-in slide-in-from-left-4 duration-1000">
                        {summary}
                    </p>
                )}

                <div className="absolute -right-4 -bottom-4 text-[120px] font-bold text-on-surface/5 select-none pointer-events-none group-hover:text-on-surface/10 transition-colors">
                    {recommendation[0]}
                </div>
            </div>

            {/* Global Score with Indicator */}
            <div className="p-8 min-w-[240px] bg-surface/30">
                <div className="text-[10px] font-label-caps text-on-surface-variant mb-3 opacity-60 tracking-[0.2em]">
                    GENEL GÜVEN PUANI
                </div>
                <div className="flex items-baseline gap-3">
                    <div className="text-5xl font-data-mono text-primary leading-none">
                        {globalScore}
                    </div>
                    <div className="text-xs font-label-caps text-on-surface-variant opacity-50">/100</div>
                </div>
                <div className="mt-4 w-full h-1 bg-outline-variant/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${globalScore}%` }}
                    ></div>
                </div>
            </div>

            {/* Confidence Index - Analytical Meter */}
            <div className="p-8 min-w-[320px] relative overflow-hidden bg-surface/50">
                <div className="text-[10px] font-label-caps text-on-surface-variant mb-4 opacity-60 tracking-[0.2em] relative z-10">
                    KALİBRE EDİLMİŞ GÜVEN ENDEKSİ
                </div>

                <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className={`text-xl font-data-mono ${uncertaintyColor}`}>
                        {confLevel}
                    </div>
                    <div className="text-xs font-data-mono text-on-surface-variant">
                        {(confidence * 100).toFixed(1)}%
                    </div>
                </div>

                {/* Analytical Meter with Shading */}
                <div className="relative h-4 w-full bg-outline-variant/20 rounded-sm overflow-hidden mb-2">
                    {/* Background segments */}
                    <div className="absolute inset-0 flex gap-0.5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex-1 border-r border-background/20"></div>
                        ))}
                    </div>
                    {/* Progress Bar */}
                    <div
                        className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-in-out ${uncertaintyColor.replace('text', 'bg')}`}
                        style={{ width: `${confidence * 100}%` }}
                    >
                        {/* Inner uncertainty pattern */}
                        <div className="absolute inset-0 uncertainty-pattern opacity-40"></div>
                    </div>
                </div>

                <div className="text-[9px] font-body-sm text-on-surface-variant opacity-50 italic">
                    Güven puanı, kanıt yoğunluğu ve ajan konsensüs varyansına göre hesaplanmıştır.
                </div>

                {confidence < 0.6 && (
                    <div className="absolute inset-0 uncertainty-pattern z-0 opacity-[0.03]"></div>
                )}
            </div>
        </div>
    );
};
