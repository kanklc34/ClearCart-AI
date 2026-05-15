import React from 'react';
import { AlertCircle } from 'lucide-react';

interface RiskModuleProps {
    title: string;
    score: number | null;
    statusColor: 'error' | 'tertiary-fixed-dim' | 'outline-variant' | 'primary';
    evidenceStrength: number; // 0-1
    findings: string[];
    isLoading?: boolean;
}

const statusColorMap = {
    'error': 'bg-error',
    'tertiary-fixed-dim': 'bg-tertiary-fixed-dim',
    'outline-variant': 'bg-outline-variant',
    'primary': 'bg-primary',
};

const getEvidenceBars = (strength: number) => {
    const filledCount = Math.ceil(strength * 5);
    const bars = [];
    for (let i = 0; i < 5; i++) {
        bars.push(i < filledCount ? 'filled' : 'empty');
    }
    return bars;
};

export const RiskModule: React.FC<RiskModuleProps> = ({
    title,
    score,
    statusColor,
    evidenceStrength,
    findings,
}) => {
    const evidenceBars = getEvidenceBars(evidenceStrength);
    const hasAnomalies = findings.length > 0 && (score !== null && (score < 60 || score > 40 && title === 'PRESSURE_DET'));

    // Muted anomaly border
    const borderColor = hasAnomalies ? 'border-tertiary/40' : 'border-outline-variant';

    return (
        <div className={`w-full h-full border ${borderColor} bg-surface-container-low flex flex-col transition-all duration-500`}>
            {/* Header */}
            <div className="p-2 md:p-3 border-b border-outline-variant text-label-caps font-label-caps text-primary bg-surface flex justify-between items-center">
                <span className="opacity-80">{title}</span>
                <span className={`w-2 h-2 ${statusColorMap[statusColor]} ${hasAnomalies ? 'animate-pulse' : ''}`}></span>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col gap-5">
                {/* Score Bar with Uncertainty Shading */}
                <div>
                    <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant mb-1.5 opacity-70">
                        <span>DIMENSION_SCORE</span>
                        <span className="text-primary font-data-mono">
                            {score !== null ? score : '--'}
                        </span>
                    </div>
                    <div className="flex h-1.5 gap-[2px]">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const percentage = (i / 12) * 100;
                            const isInScore = score !== null && percentage <= score;

                            // Uncertainty shading at the edge of the score
                            const isEdge = score !== null && Math.abs(percentage - score) < 15;

                            return (
                                <div
                                    key={i}
                                    className={`flex-1 transition-all duration-700 delay-[${i * 50}ms]
                                        ${isInScore ? statusColorMap[statusColor] : 'bg-outline-variant/30'}
                                        ${isEdge && isInScore ? 'opacity-70 uncertainty-pattern' : ''}
                                    `}
                                ></div>
                            );
                        })}
                    </div>
                </div>

                {/* Evidence Strength Meter */}
                <div>
                    <div className="text-[9px] font-label-caps text-on-surface-variant mb-1.5 opacity-60 tracking-widest">
                        EVIDENCE_DENSITY
                    </div>
                    {findings.length > 0 ? (
                        <div className="flex h-1 gap-[3px]">
                            {evidenceBars.map((bar, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-all duration-1000 
                                        ${bar === 'filled' ? 'bg-primary/60' : 'bg-outline-variant/20'}`}
                                ></div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] font-data-mono text-on-surface-variant/40 italic">
                            NO_DIRECT_SIGNALS
                        </div>
                    )}
                </div>

                {/* Audit Findings - Muted Anomaly Highlighting */}
                <div className="animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-[9px] font-label-caps text-on-surface-variant opacity-60">AUDIT_LOG</div>
                        {hasAnomalies && <AlertCircle size={10} className="text-tertiary animate-pulse" />}
                    </div>
                    {findings.length > 0 ? (
                        <ul className="flex flex-col gap-2.5">
                            {findings.slice(0, 3).map((finding, idx) => (
                                <li
                                    key={idx}
                                    className={`text-[11px] leading-relaxed font-body-sm transition-colors
                                        ${hasAnomalies ? 'text-on-surface' : 'text-on-surface-variant'}
                                    `}
                                >
                                    <span className="text-primary/40 mr-1.5">›</span>
                                    {finding}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-[11px] leading-relaxed font-body-sm text-on-surface-variant opacity-80 italic">
                            <span className="text-primary/40 mr-1.5">›</span>
                            No direct anomaly signals detected from currently visible evidence.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
