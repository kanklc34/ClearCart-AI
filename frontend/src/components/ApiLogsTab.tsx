import React from 'react';
import { Cpu, Clock, Search } from 'lucide-react';

interface LogEntry {
    agent: string;
    thought: string;
    timestamp?: string;
}

interface ApiLogsTabProps {
    logs: LogEntry[];
    isAnalyzing: boolean;
}

export const ApiLogsTab: React.FC<ApiLogsTabProps> = ({ logs, isAnalyzing }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [logs]);

    return (
        <div className="flex-1 p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="border-b border-outline-variant pb-6 flex justify-between items-end">
                    <div>
                        <div className="text-label-caps font-label-caps text-primary mb-2">INFRASTRUCTURE_LOGS_V1</div>
                        <h1 className="text-3xl font-headline-md text-on-surface tracking-tight">System Event Stream</h1>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-[10px] font-label-caps text-on-surface-variant opacity-60">LOG_ENTRIES</div>
                            <div className="text-xl font-data-mono text-primary">{logs.length}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-label-caps text-on-surface-variant opacity-60">BUFFER_STATUS</div>
                            <div className="text-xl font-data-mono text-tertiary-fixed-dim">NOMINAL</div>
                        </div>
                    </div>
                </div>

                {/* Terminal View */}
                <div className="bg-surface-container-low border border-outline-variant rounded-sm overflow-hidden flex flex-col min-h-[600px]">
                    <div className="bg-surface p-3 border-b border-outline-variant flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-error/40"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-tertiary/40"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/40"></div>
                        </div>
                        <div className="text-[10px] font-label-caps text-on-surface-variant opacity-50">STDOUT :: CLEARCART_AUDIT_CORE</div>
                    </div>

                    <div 
                        ref={scrollRef}
                        className="flex-1 p-6 font-data-mono text-xs overflow-y-auto space-y-4 scroll-smooth"
                    >
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                                <Search size={48} className="mb-4" />
                                <div className="text-label-caps tracking-[0.4em]">AWAITING_SIGNAL_INPUT</div>
                            </div>
                        ) : (
                            <>
                                {logs.map((log, idx) => (
                                    <div key={idx} className="group flex gap-6 hover:bg-primary/5 p-2 -m-2 transition-colors border-l-2 border-transparent hover:border-primary/20">
                                        <div className="w-24 shrink-0 flex flex-col opacity-40">
                                            <span className="text-[9px] text-primary">[{new Date().toLocaleTimeString()}]</span>
                                            <span className="text-[9px] uppercase mt-1">S_ID: {idx.toString(16).padStart(4, '0')}</span>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Cpu size={12} className="text-primary/60" />
                                                <span className="text-primary font-bold uppercase tracking-wider">{log.agent}</span>
                                                <span className="text-on-surface-variant/30 px-1">|</span>
                                                <span className="text-[10px] text-tertiary-fixed-dim">THREAD_001</span>
                                            </div>
                                            <p className="text-on-surface/90 leading-relaxed max-w-3xl">
                                                {log.thought}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isAnalyzing && (
                                    <div className="flex items-center gap-3 text-primary animate-pulse py-4">
                                        <Clock size={14} />
                                        <span className="text-[10px] font-label-caps tracking-[0.2em]">PROCESSING_NEXT_HEURISTIC_FRAME...</span>
                                    </div>
                                )}
                                <div id="log-end" />
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center text-[10px] font-label-caps text-on-surface-variant opacity-50 italic">
                    <div>End-to-end telemetry enabled. All agent inferences are logged for auditability.</div>
                    <div>v1.0.82-stable</div>
                </div>
            </div>
        </div>
    );
};
