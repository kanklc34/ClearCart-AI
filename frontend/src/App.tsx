import React, { useRef, useState } from 'react';
import { AlertTriangle, RefreshCw, Search, FileSearch, Loader2 } from 'lucide-react';
import {
  SideNavBar,
  TopAppBar,
  RiskModule,
  DecisionHeader,
  MetadataVectors,
  DecisionLogic,
  SignalPipeline,
  LogicExplorer,
  DiagnosticPanel,
  ApiLogsTab,
  RiskMatricesTab,
} from './components';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

type Recommendation = 'SAFE' | 'VERIFY' | 'AVOID';

interface ProgressEvent {
  agent: string;
  thought: string;
}

interface ConfidenceNote {
  level: string;
  reason: string;
}

interface EvidenceLogItem {
  type: string;
  dimension: string;
  message: string;
  impact: number;
}

interface ConsensusFactors {
  coverage?: number;
  evidence_density?: number;
  uncertainty?: number;
  correlation_risk?: number;
}

interface ModuleSignal {
  id: string;
  label: string;
  dimension: string;
  score?: number;
  findings?: string[];
  confidence?: number;
  coverage?: number;
  evidence_density?: number;
  uncertainty?: number;
}

interface ExtractionMeta {
  structured_data_found: boolean;
  text_length: number;
  html_length: number;
  is_blocked: boolean;
  platform: string;
  grounding_trace: Record<string, string>;
  grounding_explanation: string;
}

interface Reasoning {
  executive_summary: string;
  strongest_signals: { label: string; confidence: number }[];
  uncertainty_drivers: string[];
  anomalies: string[];
  counter_inference: string;
}

interface RawData {
  advocate: Record<string, unknown>;
  devils_advocate: Record<string, unknown>;
  judge: Record<string, unknown>;
  platform: string;
  is_blocked: boolean;
}

interface AuditResult {
  overall_score: number;
  recommendation: Recommendation;
  score_breakdown: Record<string, number>;
  key_findings: string[];
  confidence_note: ConfidenceNote;
  evidence_log: EvidenceLogItem[];
  module_signal_list?: ModuleSignal[];
  module_signals?: ModuleSignal[] | Record<string, ModuleSignal>;
  consensus_factors?: ConsensusFactors;
  reasoning?: Reasoning;
  _raw?: RawData;
}

interface FinalResult {
  audit: AuditResult;
  extraction_meta?: ExtractionMeta;
}

const MODULE_CONFIG = [
  { id: 'integrity_checker', title: 'BÜTÜNLÜK DENETİMİ', statusColor: 'error' as const },
  { id: 'market_validator', title: 'PAZAR DOĞRULAMA', statusColor: 'tertiary-fixed-dim' as const },
  { id: 'listing_auditor', title: 'LİSTE DENETİMİ', statusColor: 'outline-variant' as const },
  { id: 'pressure_signal_detector', title: 'BASINÇ SİNYALİ', statusColor: 'tertiary-fixed-dim' as const },
];

type StepStatus = 'pending' | 'active' | 'completed';

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score || 0)));
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Audit Engine');
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState<string>('idle');
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [result, setResult] = useState<FinalResult | null>(null);
  const [error, setError] = useState('');
  const streamRef = useRef(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [progress]);

  const PIPELINE_STEPS = [
    { id: 'capture', label: 'URL Doğrulama', key: 'Orchestrator' },
    { id: 'integrity', label: 'Veri Çıkarma', key: 'Scraper' },
    { id: 'market', label: 'Savunma Analizi', key: 'Advocate' },
    { id: 'pressure', label: 'Risk Tespiti', key: 'DevilsAdvocate' },
    { id: 'audit', label: 'Uzlaşma Hakemi', key: 'Judge' },
  ];

  const getStepStatus = (stepId: string): StepStatus => {
    if (!isAnalyzing && !result) return 'pending';
    if (result) return 'completed';
    const currentIndex = PIPELINE_STEPS.findIndex(s => s.id === stepId);
    const activeIndex = PIPELINE_STEPS.findIndex(s => s.id === activeStep);
    if (stepId === activeStep) return 'active';
    if (currentIndex < activeIndex) return 'completed';
    return 'pending';
  };

  const reset = () => {
    streamRef.current = false;
    setProgress([]);
    setResult(null);
    setError('');
    setActiveStep('idle');
  };

  const handleAnalyze = async () => {
    if (!url.trim() || isAnalyzing) return;
    reset();
    setIsAnalyzing(true);
    streamRef.current = true;

    try {
      const response = await fetch(`${API_BASE}/api/analysis/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), user_preferences: 'general' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(errorData.message || `HTTP_ERROR_${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (streamRef.current) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const dataStr = trimmed.slice(6);
              if (!dataStr) continue;
              const parsed = JSON.parse(dataStr) as {
                error?: string;
                final?: boolean;
                result?: FinalResult;
                agent?: string;
                thought?: string;
              };

              if (parsed.error) {
                setError(parsed.error);
                setIsAnalyzing(false);
                streamRef.current = false;
                return;
              }
              if (parsed.final && parsed.result) {
                setResult(parsed.result);
                setIsAnalyzing(false);
                streamRef.current = false;
                return;
              }
              if (parsed.agent && parsed.thought) {
                const step = PIPELINE_STEPS.find(s => s.key === parsed.agent);
                if (step) setActiveStep(step.id);
                setProgress(items => [...items, { agent: parsed.agent!, thought: parsed.thought! }]);
              }
            } catch (e) { console.warn('SSE Parse Error:', e); }
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Beklenmedik bir hata oluştu.';
      setError(message);
    } finally {
      setIsAnalyzing(false);
      streamRef.current = false;
    }
  };

  const audit = result?.audit;
  const moduleSignals: ModuleSignal[] = audit?.module_signal_list ??
    (Array.isArray(audit?.module_signals)
      ? (audit.module_signals as ModuleSignal[])
      : audit?.module_signals
        ? Object.values(audit.module_signals as Record<string, ModuleSignal>)
        : []);

  const getModuleSignal = (id: string) => moduleSignals.find(m => m.id === id);
  const recValue: Recommendation = (audit?.recommendation ?? 'VERIFY') as Recommendation;

  return (
    <div className="dark min-h-screen bg-background text-on-surface">
      <SideNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopAppBar activeTab={activeTab} onTabChange={setActiveTab} isAnalyzing={isAnalyzing} />

        {activeTab === 'Logic Explorer' ? (
          <LogicExplorer />
        ) : activeTab === 'API Logs' ? (
          <ApiLogsTab logs={progress} isAnalyzing={isAnalyzing} />
        ) : activeTab === 'Risk Matrices' ? (
          audit ? (
            <RiskMatricesTab
              evidenceLog={audit.evidence_log || []}
              consensusFactors={audit.consensus_factors}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
              <div className="text-label-caps font-label-caps tracking-[0.3em]">
                DENETİM VERİSİ YOK — ÖNCE BİR TARAMA YAPIN
              </div>
            </div>
          )
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Search Section */}
            <section className="px-6 py-8 border-b border-outline-variant bg-surface-container-lowest">
              <div className="max-w-4xl">
                <div className="mb-6">
                  <h2 className="text-3xl font-headline-md text-primary tracking-tight">Denetim Motoru</h2>
                  <p className="text-body-md text-on-surface-variant mt-2">Pazaryeri güven doğrulaması için otonom konsensüs sistemini devreye al.</p>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-3 px-4 py-3 border border-outline-variant bg-surface-container-low rounded-sm focus-within:border-primary transition-colors">
                    <FileSearch size={20} className="text-on-surface-variant shrink-0" />
                    <input
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                      placeholder="Ürün ilan URL'sini yapıştırın (Amazon, Trendyol, Hepsiburada...)"
                      className="flex-1 bg-transparent border-0 text-primary placeholder-on-surface-variant focus:outline-none text-body-md"
                    />
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !url.trim()}
                    className="self-stretch px-8 bg-primary text-on-primary font-label-caps text-label-caps hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-3"
                  >
                    {isAnalyzing
                      ? <><RefreshCw size={18} className="animate-spin" /> ANALİZ EDİLİYOR</>
                      : <><Search size={18} /> TARA</>}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-4 border border-error bg-error/10 flex gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={20} className="text-error shrink-0" />
                    <div>
                      <div className="text-label-caps font-bold text-error">SİSTEM_HATASI</div>
                      <div className="text-body-sm text-on-surface mt-1">{error}</div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
              {(isAnalyzing || (progress.length > 0 && !audit)) && (
                <section className="p-6">
                  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-4 border border-outline-variant bg-surface-container-low p-6">
                      <div className="text-label-caps font-label-caps text-primary mb-6">DENETİM_SÜRECİ</div>
                      <SignalPipeline steps={PIPELINE_STEPS.map(s => ({ ...s, status: getStepStatus(s.id) }))} />
                    </div>
                    <div className="md:col-span-8 border border-outline-variant bg-surface-container-low flex flex-col h-[500px]">
                      <div className="p-4 border-b border-outline-variant bg-surface text-label-caps font-label-caps text-primary">AJAN_LOG_AKIŞI</div>
                      <div ref={logContainerRef} className="p-6 space-y-4 overflow-y-auto scroll-smooth">
                        {progress.map((event, idx) => (
                          <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-left-4">
                            <div className="w-1 h-1 bg-primary rounded-full mt-2.5 shrink-0" />
                            <div>
                              <div className="text-[10px] font-label-caps text-primary/70">{event.agent.toUpperCase()}</div>
                              <div className="text-body-sm text-on-surface mt-1 leading-relaxed">{event.thought}</div>
                            </div>
                          </div>
                        ))}
                        {isAnalyzing && (
                          <div className="flex items-center gap-3 text-primary/50 text-[10px] font-label-caps tracking-widest mt-4">
                            <Loader2 size={12} className="animate-spin" /> ÇIKARIM_ÜRETİLİYOR...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {audit && (
                <section className="p-6 animate-in fade-in duration-1000">
                  <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4">

                    <div className="col-span-12">
                      <DecisionHeader
                        recommendation={recValue}
                        globalScore={clampScore(audit.overall_score)}
                        confidence={audit.consensus_factors?.uncertainty ? (1 - audit.consensus_factors.uncertainty) : 0.7}
                        summary={audit.reasoning?.executive_summary}
                      />
                    </div>

                    <div className="col-span-12 grid grid-cols-12 gap-4 items-stretch">
                      {MODULE_CONFIG.map(config => {
                        const signal = getModuleSignal(config.id);
                        return (
                          <div key={config.id} className="col-span-12 sm:col-span-6 lg:col-span-3">
                            <RiskModule
                              title={config.title}
                              score={signal?.score !== undefined ? clampScore(signal.score) : null}
                              statusColor={config.statusColor}
                              evidenceStrength={signal?.evidence_density || 0}
                              findings={signal?.findings || []}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="col-span-12 grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-12 lg:col-span-4">
                        <MetadataVectors
                          correlationRisk={audit.consensus_factors?.correlation_risk || 0.2}
                          uncertainty={audit.consensus_factors?.uncertainty || 0.3}
                          coverage={audit.consensus_factors?.coverage || 0.8}
                          evidenceDensity={audit.consensus_factors?.evidence_density || 0.5}
                        />
                      </div>
                      <div className="col-span-12 lg:col-span-8 space-y-4">
                        <DecisionLogic
                          strongestSignals={
                            audit.reasoning?.strongest_signals ||
                            audit.key_findings.slice(0, 3).map(f => ({ label: f, confidence: 0.8 }))
                          }
                          uncertaintyDrivers={
                            audit.reasoning?.uncertainty_drivers ||
                            ['Partial feature overlap', 'Epistemic variance detected']
                          }
                          anomalies={
                            audit.reasoning?.anomalies ||
                            (audit.evidence_log.length > 0
                              ? audit.evidence_log.filter(e => e.impact < 0).map(e => e.message)
                              : audit.key_findings.filter(f => f.toLowerCase().includes('risk')).slice(0, 5))
                          }
                          rawAudit={audit._raw ?? audit}
                        />
                        {result.extraction_meta && (
                          <DiagnosticPanel meta={result.extraction_meta} />
                        )}
                      </div>
                    </div>

                    <div className="col-span-12 flex justify-center py-8">
                      <button
                        onClick={reset}
                        className="px-8 py-3 border border-outline-variant text-label-caps font-label-caps hover:border-primary hover:text-primary transition-all flex items-center gap-3"
                      >
                        <RefreshCw size={18} /> YENİ DENETİM OTURUMU
                      </button>
                    </div>

                  </div>
                </section>
              )}

              {!isAnalyzing && progress.length === 0 && !audit && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                  <FileSearch size={64} className="mb-4" />
                  <div className="text-label-caps font-label-caps tracking-[0.3em]">SİSTEM_ANALİZE_HAZIR</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .uncertainty-pattern {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px);
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}