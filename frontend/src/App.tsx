import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

// ── Types ──────────────────────────────────────────────────────────────────
interface AgentThought {
  agent: string;
  thought: string;
  data?: Record<string, unknown>;
}

interface AdvocateResult {
  verdict: string;
  confidence: number;
  top_arguments: string[];
  trust_signals: string[];
  score_estimate: Record<string, number>;
  summary: string;
}

interface DevilsResult {
  verdict: string;
  confidence: number;
  top_arguments: string[];
  dark_patterns: string[];
  rebuttals: string[];
  regret_scenarios: string[];
  score_estimate: Record<string, number>;
  summary: string;
}

interface JudgeResult {
  overall_score: number;
  trust_adjusted_score: number;
  verdict: 'AL' | 'DİKKAT' | 'ALMA';
  advocate_advice: string;
  debate_winner: string;
  debate_clash_points: string[];
  debate_summary: string;
  critical_bullets: string[];
  regret_forecast: { probability: string; reason: string };
  categories: Record<string, { score: number; status: string; note: string }>;
  platform_audit: string;
}

interface FinalResult {
  platform: string;
  is_blocked: boolean;
  advocate: AdvocateResult;
  devils_advocate: DevilsResult;
  judge: JudgeResult;
}

// ── Agent config ───────────────────────────────────────────────────────────
const AGENT_META: Record<string, { label: string; color: string; icon: string }> = {
  Orchestrator: { label: 'Orkestratör', color: '#94a3b8', icon: '◎' },
  Scraper: { label: 'Veri Toplayıcı', color: '#38bdf8', icon: '⬡' },
  Advocate: { label: 'Savunucu', color: '#34d399', icon: '▲' },
  DevilsAdvocate: { label: 'İtirazcı', color: '#f87171', icon: '▼' },
  Judge: { label: 'Hakem', color: '#fbbf24', icon: '⊕' },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const verdictConfig = {
  AL: { bg: '#022c22', border: '#34d399', text: '#34d399', label: 'AL' },
  DİKKAT: { bg: '#1c1400', border: '#fbbf24', text: '#fbbf24', label: 'DİKKAT' },
  ALMA: { bg: '#1c0202', border: '#f87171', text: '#f87171', label: 'ALMA' },
};

const catLabels: Record<string, string> = {
  legal: 'Hukuki', financial: 'Finansal', trust: 'Güven', safety: 'Güvenlik',
};

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x="36" y="41" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="monospace">
        {score}
      </text>
    </svg>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [url, setUrl] = useState('');
  const [profile, setProfile] = useState({ prime: false, installments: false, student: false });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [liveAdvocate, setLiveAdvocate] = useState<AdvocateResult | null>(null);
  const [liveDevils, setLiveDevils] = useState<DevilsResult | null>(null);
  const [result, setResult] = useState<FinalResult | null>(null);
  const [error, setError] = useState('');
  const streamRef = useRef<boolean>(false);

  const reset = () => {
    setThoughts([]); setLiveAdvocate(null); setLiveDevils(null);
    setResult(null); setError('');
  };

  const handleAnalyze = async () => {
    if (!url.trim() || isAnalyzing) return;
    reset();
    setIsAnalyzing(true);
    streamRef.current = true;

    const userContext = `Prime: ${profile.prime}, Taksit: ${profile.installments}, Öğrenci: ${profile.student}`;

    try {
      const res = await fetch(`${API_BASE}/api/analysis/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), user_preferences: userContext }),
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const dec = new TextDecoder();

      while (streamRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = dec.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.error) { setError(parsed.error); setIsAnalyzing(false); return; }
            if (parsed.final) { setResult(parsed.result); setIsAnalyzing(false); return; }
            if (parsed.agent) {
              setThoughts(p => [...p, { agent: parsed.agent, thought: parsed.thought, data: parsed.data }]);
              if (parsed.data?.advocate) setLiveAdvocate(parsed.data.advocate);
              if (parsed.data?.devils_advocate) setLiveDevils(parsed.data.devils_advocate);
            }
          } catch {
            // JSON parse hatası, devam et
          }
        }
      }
    } catch {
      setError('Bağlantı kurulamadı. Backend çalışıyor mu?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#04060f', color: '#e2e8f0', fontFamily: "'DM Mono', 'Courier New', monospace", overflowX: 'hidden' }}>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '60vh', background: 'radial-gradient(ellipse, rgba(52,211,153,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── Header ── */}
        <header style={{ padding: '40px 0 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, border: '2px solid #34d399', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⊛</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>
                ClearCart<span style={{ color: '#34d399' }}>AI</span>
              </div>
              <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#475569', marginTop: 2 }}>COMMERCE TRUST LAYER</div>
            </div>
          </div>

          {/* Profile toggles */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'prime', label: 'Prime' },
              { key: 'installments', label: 'Taksit' },
              { key: 'student', label: 'Öğrenci' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setProfile(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                style={{
                  padding: '7px 14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                  border: `1px solid ${profile[key as keyof typeof profile] ? '#34d399' : '#1e293b'}`,
                  background: profile[key as keyof typeof profile] ? 'rgba(52,211,153,0.1)' : 'transparent',
                  color: profile[key as keyof typeof profile] ? '#34d399' : '#475569',
                  borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <h1 style={{ fontSize: 'clamp(48px, 9vw, 96px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff', margin: '0 0 24px' }}>
            SATMADAN ÖNCE<br />
            <span style={{ color: '#34d399' }}>DENETİM.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#475569', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Üç bağımsız ajan tartışır — Savunucu, İtirazcı, Hakem.<br />
            Platformun değil, sizin için çalışır.
          </p>

          {/* URL Input */}
          <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
            <div style={{
              display: 'flex', gap: 0, border: '1px solid #1e293b',
              borderRadius: 16, overflow: 'hidden', background: '#080d1a',
              boxShadow: '0 0 0 1px rgba(52,211,153,0.0)',
              transition: 'box-shadow 0.3s',
            }}>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                placeholder="Ürün URL'sini yapıştırın..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  padding: '18px 20px', fontSize: 14, color: '#e2e8f0', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
                style={{
                  padding: '18px 32px', background: isAnalyzing ? '#0f1a2e' : '#34d399',
                  border: 'none', color: isAnalyzing ? '#475569' : '#030a08',
                  fontWeight: 900, fontSize: 13, letterSpacing: '0.1em',
                  cursor: isAnalyzing || !url.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
              >
                {isAnalyzing ? '⟳ ANALİZ...' : 'DENETLE →'}
              </button>
            </div>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ marginTop: 12, color: '#f87171', fontSize: 13, textAlign: 'left', padding: '0 4px' }}>
                ⚠ {error}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Live Debate Stream ── */}
        <AnimatePresence>
          {(isAnalyzing || (thoughts.length > 0 && !result)) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ maxWidth: 680, margin: '0 auto 48px', border: '1px solid #0f172a', borderRadius: 20, overflow: 'hidden', background: '#060b18' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: isAnalyzing ? 'pulse 1s infinite' : 'none' }} />
                <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#475569' }}>CANLI AJAN AKIŞI</span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 320, overflowY: 'auto' }}>
                {thoughts.map((t, i) => {
                  const meta = AGENT_META[t.agent] || { label: t.agent, color: '#94a3b8', icon: '○' };
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                        color: meta.color, border: `1px solid ${meta.color}33`,
                        background: `${meta.color}11`, padding: '3px 8px', borderRadius: 6,
                        whiteSpace: 'nowrap', minWidth: 100, textAlign: 'center',
                      }}>
                        {meta.icon} {meta.label}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, paddingTop: 2 }}>
                        {t.thought}
                      </span>
                    </motion.div>
                  );
                })}
                {isAnalyzing && (
                  <div style={{ display: 'flex', gap: 4, paddingLeft: 4 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{
                        width: 4, height: 4, borderRadius: '50%', background: '#34d399',
                        animation: `bounce 1.2s ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Live debate preview while streaming */}
              {(liveAdvocate || liveDevils) && (
                <div style={{ borderTop: '1px solid #0f172a', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {liveAdvocate && (
                    <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#34d399', marginBottom: 6 }}>▲ SAVUNUCU</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{liveAdvocate.summary}</div>
                      <div style={{ fontSize: 10, color: '#34d399', marginTop: 6, fontWeight: 700 }}>Güven: {liveAdvocate.confidence}%</div>
                    </div>
                  )}
                  {liveDevils && (
                    <div style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#f87171', marginBottom: 6 }}>▼ İTİRAZCI</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{liveDevils.summary}</div>
                      <div style={{ fontSize: 10, color: '#f87171', marginTop: 6, fontWeight: 700 }}>Risk: {liveDevils.confidence}%</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Final Result ── */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(() => {
                const j = result.judge;
                const vc = verdictConfig[j.verdict] || verdictConfig['DİKKAT'];

                return (
                  <>
                    {/* ── Verdict banner ── */}
                    <div style={{
                      border: `2px solid ${vc.border}`, borderRadius: 20,
                      background: vc.bg, padding: '32px 40px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: 20,
                    }}>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: '0.3em', color: vc.text, marginBottom: 6 }}>HAKEM KARARI — {result.platform?.toUpperCase()}</div>
                        <div style={{ fontSize: 'clamp(48px, 8vw, 72px)', fontWeight: 900, color: vc.text, lineHeight: 0.9, letterSpacing: '-0.03em' }}>
                          {j.verdict}
                        </div>
                        <div style={{ marginTop: 12, fontSize: 15, color: '#e2e8f0', maxWidth: 520, lineHeight: 1.5 }}>
                          {j.advocate_advice}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 72, fontWeight: 900, color: vc.text, lineHeight: 1 }}>{j.overall_score}</div>
                        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#475569' }}>/ 100 PUAN</div>
                        <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                          Pişmanlık Riski: <span style={{ color: parseInt(j.regret_forecast.probability) > 50 ? '#f87171' : '#34d399', fontWeight: 700 }}>{j.regret_forecast.probability}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Debate: Advocate vs Devils ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {/* Advocate */}
                      <div style={{ border: '1px solid rgba(52,211,153,0.2)', borderRadius: 16, padding: 24, background: 'rgba(52,211,153,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#34d399' }}>▲ SAVUNUCU</span>
                          <span style={{ fontSize: 9, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                            {result.advocate.confidence}% güven
                          </span>
                          {result.judge.debate_winner === 'advocate' && (
                            <span style={{ fontSize: 9, color: '#fbbf24', marginLeft: 'auto' }}>⊕ KAZANDI</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {result.advocate.top_arguments.map((a, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#94a3b8', paddingLeft: 12, borderLeft: '2px solid rgba(52,211,153,0.3)', lineHeight: 1.5 }}>
                              {a}
                            </div>
                          ))}
                        </div>
                        {result.advocate.trust_signals?.length > 0 && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(52,211,153,0.1)' }}>
                            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#475569', marginBottom: 8 }}>GÜVEN SİNYALLERİ</div>
                            {result.advocate.trust_signals.map((s, i) => (
                              <div key={i} style={{ fontSize: 11, color: '#34d399', marginBottom: 4 }}>✓ {s}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Devils Advocate */}
                      <div style={{ border: '1px solid rgba(248,113,113,0.2)', borderRadius: 16, padding: 24, background: 'rgba(248,113,113,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#f87171' }}>▼ İTİRAZCI</span>
                          <span style={{ fontSize: 9, color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                            {result.devils_advocate.confidence}% risk
                          </span>
                          {result.judge.debate_winner === 'devils_advocate' && (
                            <span style={{ fontSize: 9, color: '#fbbf24', marginLeft: 'auto' }}>⊕ KAZANDI</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {result.devils_advocate.top_arguments.map((a, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#94a3b8', paddingLeft: 12, borderLeft: '2px solid rgba(248,113,113,0.3)', lineHeight: 1.5 }}>
                              {a}
                            </div>
                          ))}
                        </div>
                        {result.devils_advocate.dark_patterns?.length > 0 && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(248,113,113,0.1)' }}>
                            <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#475569', marginBottom: 8 }}>DARK PATTERNS</div>
                            {result.devils_advocate.dark_patterns.map((d, i) => (
                              <div key={i} style={{ fontSize: 11, color: '#f87171', marginBottom: 4 }}>⚠ {d}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Clash Points ── */}
                    {j.debate_clash_points?.length > 0 && (
                      <div style={{ border: '1px solid #1e293b', borderRadius: 16, padding: 24, background: '#060b18' }}>
                        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#fbbf24', marginBottom: 16 }}>⊕ HAKEM — ÇARPIŞMA NOKTALARI</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                          {j.debate_clash_points.map((p, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '10px 14px', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', borderRadius: 10, lineHeight: 1.5 }}>
                              {p}
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 16, fontSize: 12, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic', borderTop: '1px solid #0f172a', paddingTop: 14 }}>
                          "{j.debate_summary}"
                        </div>
                      </div>
                    )}

                    {/* ── Category scores ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {Object.entries(j.categories || {}).map(([key, cat]) => {
                        const color = cat.status === 'good' ? '#34d399' : cat.status === 'warning' ? '#fbbf24' : '#f87171';
                        return (
                          <div key={key} style={{ border: '1px solid #1e293b', borderRadius: 14, padding: '18px 16px', background: '#060b18', textAlign: 'center' }}>
                            <ScoreRing score={cat.score} color={color} />
                            <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#475569', marginTop: 8 }}>{catLabels[key] || key}</div>
                            {cat.note && <div style={{ fontSize: 10, color: '#334155', marginTop: 4, lineHeight: 1.4 }}>{cat.note}</div>}
                          </div>
                        );
                      })}
                    </div>

                    {/* ── Critical bullets ── */}
                    {j.critical_bullets?.length > 0 && (
                      <div style={{ border: '1px solid #1e293b', borderRadius: 16, padding: 24, background: '#060b18' }}>
                        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: '#94a3b8', marginBottom: 16 }}>KRİTİK NOTLAR</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
                          {j.critical_bullets.map((b, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', background: '#080d1a', borderRadius: 10, border: '1px solid #0f172a' }}>
                              <span style={{ color: '#34d399', marginTop: 1, flexShrink: 0 }}>◈</span>
                              <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Regret forecast ── */}
                    <div style={{ border: '1px solid #1e293b', borderRadius: 16, padding: '20px 24px', background: '#060b18', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#475569', marginBottom: 4 }}>PİŞMANLIK TAHMİNİ</div>
                        <div style={{ fontSize: 36, fontWeight: 900, color: parseInt(j.regret_forecast.probability) > 50 ? '#f87171' : '#34d399' }}>
                          {j.regret_forecast.probability}
                        </div>
                      </div>
                      <div style={{ flex: 1, fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                        {j.regret_forecast.reason}
                      </div>
                    </div>

                    {/* ── Platform audit ── */}
                    {(j.platform_audit || result.is_blocked) && (
                      <div style={{ border: `1px solid ${result.is_blocked ? 'rgba(248,113,113,0.3)' : '#1e293b'}`, borderRadius: 16, padding: '16px 24px', background: result.is_blocked ? 'rgba(248,113,113,0.04)' : '#060b18' }}>
                        <div style={{ fontSize: 9, letterSpacing: '0.25em', color: result.is_blocked ? '#f87171' : '#475569', marginBottom: 8 }}>
                          {result.is_blocked ? '⚠ PLATFORM VERİ ERİŞİMİNİ ENGELLEDİ' : 'PLATFORM DENETİMİ'}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>{j.platform_audit}</div>
                      </div>
                    )}

                    {/* New analysis button */}
                    <div style={{ textAlign: 'center', paddingTop: 8 }}>
                      <button onClick={() => { reset(); setUrl(''); }} style={{
                        padding: '12px 28px', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                        border: '1px solid #1e293b', background: 'transparent', color: '#475569',
                        borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                      }}>
                        ← YENİ ANALİZ
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #1e293b; }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
        @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
      `}</style>
    </div>
  );
}