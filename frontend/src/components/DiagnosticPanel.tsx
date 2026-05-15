import React from 'react';
import { Terminal, CheckCircle2, XCircle, Activity } from 'lucide-react';

interface DiagnosticPanelProps {
    meta: {
        structured_data_found: boolean;
        text_length: number;
        html_length: number;
        is_blocked: boolean;
        platform: string;
        grounding_trace: Record<string, string>;
        grounding_explanation: string;
    };
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({ meta }) => {
    return (
        <div className="border border-outline-variant bg-surface-container-low p-5 font-data-mono flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
                <Terminal size={16} className="text-primary" />
                <span className="text-xs font-label-caps text-primary">EXTRACTION_DIAGNOSTICS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Sol kolon: meta bilgiler */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-on-surface-variant opacity-60 uppercase">Structured Data</span>
                        {meta.structured_data_found
                            ? <CheckCircle2 size={12} className="text-primary" />
                            : <XCircle size={12} className="text-error" />
                        }
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-on-surface-variant opacity-60 uppercase">Platform Scope</span>
                        <span className="text-primary font-bold">{meta.platform.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-on-surface-variant opacity-60 uppercase">Text Recovery</span>
                        <span className="text-primary">{meta.text_length} chars</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-on-surface-variant opacity-60 uppercase">HTML Buffer</span>
                        <span className="text-primary">{Math.round(meta.html_length / 1024)} KB</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                        <span className="text-on-surface-variant opacity-60 uppercase">Access Status</span>
                        <span className={meta.is_blocked ? 'text-error' : 'text-primary'}>
                            {meta.is_blocked ? 'LIMITED_ACCESS' : 'FULL_VERIFIED'}
                        </span>
                    </div>
                </div>

                {/* Sağ kolon: grounding trace */}
                <div className="space-y-2 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-6">
                    <div className="text-[10px] font-label-caps text-on-surface-variant opacity-60 mb-3">
                        GROUNDING_TRACE
                    </div>
                    {Object.entries(meta.grounding_trace).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start gap-4 text-[10px]">
                            <span className="opacity-50 text-[9px] uppercase shrink-0">
                                {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-primary font-bold text-right break-all">
                                {String(value || 'NULL')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Explanation */}
            <div className="bg-surface p-3 border border-outline-variant/50 flex gap-3 items-start">
                <Activity size={14} className="text-primary mt-0.5 shrink-0" />
                <div className="text-[11px] leading-relaxed min-w-0">
                    <span className="text-on-surface-variant opacity-60 mr-2 uppercase text-[9px] font-bold">
                        Explanation:
                    </span>
                    <span className="text-on-surface italic text-primary/90 break-words">
                        {meta.grounding_explanation}
                    </span>
                </div>
            </div>
        </div>
    );
};