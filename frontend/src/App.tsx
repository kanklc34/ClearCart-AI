import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, AlertTriangle, Info, BrainCircuit, Zap, Terminal, ShieldAlert, Settings2, Loader2, Scale, Gavel, Eye, FileSearch, ShieldEllipsis, Star } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface UserProfile {
    hasPrime: boolean;
    useInstallments: boolean;
    isStudent: boolean;
}

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [displayThoughts, setDisplayThoughts] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState<UserProfile>({
    hasPrime: false,
    useInstallments: false,
    isStudent: false
  });

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    setError('');
    setResult(null);
    setDisplayThoughts([]);

    const userContext = `Prime: ${profile.hasPrime}, Taksit: ${profile.useInstallments}, Öğrenci: ${profile.isStudent}`;

    try {
      const response = await fetch(`${API_BASE}/api/analysis/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, user_preferences: userContext }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.error) { setError(data.error); setIsAnalyzing(false); return; }
              if (data.agent && data.thought) setDisplayThoughts(prev => [...prev, data]);
              if (data.analysis) setResult(data);
              if (data.is_scam) setResult(data);
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30 font-sans pb-20 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <div>
                <h1 className="text-4xl font-black tracking-tighter italic leading-none">ClearCart <span className="text-emerald-500">AI</span></h1>
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-slate-600 mt-1">Universal Audit Standard</p>
            </div>
          </div>
          
          <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
            <button onClick={() => setProfile({...profile, hasPrime: !profile.hasPrime})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${profile.hasPrime ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                Prime Status
            </button>
            <button onClick={() => setProfile({...profile, useInstallments: !profile.useInstallments})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${profile.useInstallments ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                Installments
            </button>
          </div>
        </header>

        <div className="text-center mb-20">
            <motion.h2 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-6xl md:text-9xl font-black mb-8 italic tracking-tighter leading-none text-white">
                PLATFORM <br /> <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent underline decoration-emerald-500/10 underline-offset-8">DENETİMİ.</span>
            </motion.h2>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-12 font-medium">
                Mağaza puanlarına değil, evrensel tüketici haklarına güvenin. <br />
                <span className="text-slate-300">ClearCart AI ile gerçek riskleri keşfedin.</span>
            </p>

            <div className="max-w-4xl mx-auto relative group">
                <div className="relative flex flex-col md:flex-row items-center bg-slate-900/80 border border-slate-800 rounded-[32px] p-4 focus-within:border-emerald-500/40 transition-all shadow-3xl backdrop-blur-xl">
                    <div className="flex-1 flex items-center w-full">
                        <div className="pl-6 pr-3 text-slate-600 font-mono text-xs tracking-widest uppercase">
                            Analysis:
                        </div>
                        <input 
                            type="text" 
                            placeholder="Ürün URL'sini evrensel denetime sokun..."
                            className="w-full bg-transparent border-none outline-none text-slate-100 py-6 text-xl font-medium placeholder:text-slate-700"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        />
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !url}
                        className="w-full md:w-auto bg-white hover:bg-emerald-500 hover:text-white disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black px-12 py-6 rounded-[24px] transition-all flex items-center justify-center gap-3 uppercase tracking-tighter text-lg shadow-2xl"
                    >
                        {isAnalyzing ? <><Loader2 className="animate-spin" size={24}/> Auditing...</> : "Denetle"}
                    </button>
                </div>
            </div>
        </div>

        {/* Live Thoughts Stream */}
        {(isAnalyzing || displayThoughts.length > 0) && !result?.analysis && !result?.is_scam && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mb-20">
                <div className="flex items-center gap-4 mb-6 font-mono text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">
                    <Terminal size={16} className="text-emerald-500 animate-pulse" /> Global Audit in Progress
                </div>
                <div className="space-y-3">
                    {displayThoughts.map((t, i) => (
                        <div key={i} className="flex gap-4 items-center bg-slate-900/30 p-4 rounded-2xl border border-slate-800/50">
                            <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md uppercase font-bold tracking-tighter">{t.agent}</span>
                            <span className="text-xs font-mono text-slate-500 italic">"Step {i+1}: {t.thought}"</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        )}

        {/* Results Dashboard */}
        <AnimatePresence>
          {result && !isAnalyzing && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              
              {/* SCAM ALERT */}
              {result.is_scam && (
                <div className="bg-red-950/40 border-4 border-red-500 rounded-[48px] p-16 backdrop-blur-3xl relative overflow-hidden text-center shadow-[0_0_100px_rgba(239,68,68,0.2)]">
                    <ShieldAlert size={120} className="text-red-500 mx-auto mb-8 animate-bounce" />
                    <h3 className="text-5xl font-black text-red-500 mb-6 italic uppercase tracking-tighter">FRAUD TESPİT EDİLDİ</h3>
                    <p className="text-2xl font-bold text-slate-100 mb-10 leading-relaxed max-w-3xl mx-auto italic">"{result.scam_reason}"</p>
                    <div className="inline-block bg-red-500 text-white px-12 py-5 rounded-2xl font-black text-xl uppercase tracking-widest shadow-2xl">EMNİYET KİLİDİ AKTİF</div>
                </div>
              )}

              {/* SUCCESS RESULTS DASHBOARD */}
              {result.analysis && (
                <div className="space-y-8">
                  {/* Category Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { id: 'legal', label: 'Yasal Uyumluluk', icon: <Scale size={20}/>, data: result.analysis.categories.legal },
                      { id: 'financial', label: 'Finansal Dürüstlük', icon: <Gavel size={20}/>, data: result.analysis.categories.financial },
                      { id: 'transparency', label: 'Şeffaflık', icon: <FileSearch size={20}/>, data: result.analysis.categories.transparency },
                      { id: 'safety', label: 'Ürün Güvenliği', icon: <ShieldEllipsis size={20}/>, data: result.analysis.categories.safety },
                    ].map((cat) => (
                      <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 flex flex-col items-center shadow-xl hover:bg-slate-800/50 transition-all group">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                            cat.data.status === 'good' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                            cat.data.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                        }`}>
                            {cat.icon}
                        </div>
                        <h5 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 mb-2">{cat.label}</h5>
                        <span className="text-4xl font-black italic mb-4 text-white">{cat.data.score}</span>
                        <p className="text-[10px] text-slate-500 text-center leading-relaxed h-14 overflow-hidden">{cat.data.details}</p>
                      </div>
                    ))}
                  </div>

                  {/* Main Recommendation & Platform Audit */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-gradient-to-br from-white to-slate-100 text-slate-950 rounded-[48px] p-16 flex flex-col justify-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-12 text-slate-200 pointer-events-none">
                            <BrainCircuit size={220} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 flex items-center gap-2">
                            <Zap size={16} /> ClearCart Denetim Sonucu
                        </h4>
                        <p className="text-4xl md:text-6xl font-black italic leading-[0.95] tracking-tighter relative z-10 uppercase">
                            "{result.analysis.advocate_advice}"
                        </p>
                    </div>

                    <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[48px] p-12 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 text-white/5 rotate-12">
                             <FileSearch size={180} />
                        </div>
                        <h4 className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2 italic relative z-10">
                            <Star size={16} /> Platform Audit Insight
                        </h4>
                        <div className="relative z-10 bg-slate-950/50 p-6 rounded-[28px] border border-slate-800 shadow-inner">
                            <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
                                {result.analysis.platform_audit || "Platform verileri standartlara uygun bulunmuştur."}
                            </p>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Verified by Universal Standards
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center mt-32 py-10 text-[10px] font-black uppercase tracking-[1em] text-slate-800 italic">
        ClearCart AI • The Universal Consumer Firewall
      </footer>
    </div>
  );
};

export default App;
