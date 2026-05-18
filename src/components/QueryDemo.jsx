import { useState } from "react";

const SUGGESTED = [
  "Who has won the most championships?",
  "What's the biggest blowout in league history?",
  "How did Brandon do in 2025?",
  "Who got the best FAAB bargain ever?",
];

export default function QueryDemo() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSources, setShowSources] = useState(false);

  async function runQuery(q) {
    const text = q || question;
    if (!text.trim()) return;
    setLoading(true); setResult(null); setError(null); setShowSources(false);
    setQuestion(text);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vault unavailable");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="query" style={{ background:"var(--ink)", borderBottom:"1px solid rgba(245,166,35,0.1)", padding:"80px 0", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", bottom:"-30%", left:"-10%", width:500, height:500, background:"radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"0 32px", position:"relative", zIndex:1 }}>
        <p className="section-label" style={{ marginBottom:12 }}>AI Query · Grounded · Governed</p>
        <h2 className="font-display" style={{ fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:900, marginBottom:12 }}>Ask the vault</h2>
        <p style={{ color:"var(--text-dim)", fontSize:"0.95rem", marginBottom:32, lineHeight:1.6 }}>Every answer is grounded in verified data. The model receives only canonical facts — it cannot fabricate. If a record isn't in the archive, it says so.</p>

        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
          {SUGGESTED.map((s,i) => (
            <button key={i} onClick={() => runQuery(s)} disabled={loading} className="font-mono"
              style={{ fontSize:"0.65rem", letterSpacing:"0.06em", padding:"7px 13px", background:"transparent", border:"1px solid rgba(245,166,35,0.2)", color:"var(--text-dim)", cursor:loading?"not-allowed":"pointer", borderRadius:2, opacity:loading?0.5:1 }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", marginBottom:28 }}>
          <input className="vault-input" style={{ borderRadius:"2px 0 0 2px" }} value={question}
            onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key==="Enter" && !loading && runQuery()}
            placeholder="Ask anything about PFL Buddies history..." disabled={loading} />
          <button onClick={() => runQuery()} disabled={loading || !question.trim()}
            style={{ background:loading?"rgba(245,166,35,0.3)":"var(--amber)", color:"var(--ink)", border:"none", padding:"0 24px", fontFamily:"'IBM Plex Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.1em", textTransform:"uppercase", cursor:loading||!question.trim()?"not-allowed":"pointer", fontWeight:500, borderRadius:"0 2px 2px 0", minWidth:80 }}>
            {loading ? "..." : "Query"}
          </button>
        </div>

        {loading && (
          <div style={{ padding:"24px 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div className="animate-pulse-a" style={{ width:8, height:8, borderRadius:"50%", background:"var(--amber)" }} />
              <span className="font-mono" style={{ fontSize:"0.68rem", letterSpacing:"0.15em", color:"var(--amber)", textTransform:"uppercase" }}>Pulling from vault...</span>
            </div>
            {[100,72,88].map((w,i) => <div key={i} style={{ height:11, width:w+"%", background:"rgba(245,166,35,0.08)", borderRadius:2, marginBottom:9 }} />)}
          </div>
        )}

        {error && <div style={{ padding:"16px 20px", border:"1px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.05)", borderRadius:2, color:"#ef4444", fontFamily:"'IBM Plex Mono',monospace", fontSize:"0.8rem" }}>{error}</div>}

        {result && !loading && (
          <div className="animate-vault" style={{ border:"1px solid rgba(245,166,35,0.3)", background:"rgba(245,166,35,0.03)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ padding:"14px 24px", borderBottom:"1px solid rgba(245,166,35,0.15)", display:"flex", alignItems:"center", gap:12, background:"rgba(245,166,35,0.04)" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e" }} />
              <span className="badge-verified">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3.5" stroke="currentColor"/><path d="M2.5 4l1 1 2-2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/></svg>
                Verified · 16 seasons · canonical data
              </span>
            </div>
            <div style={{ padding:"28px 24px" }}>
              <p style={{ fontSize:"1.05rem", lineHeight:1.75, fontWeight:300, margin:0 }}>{result.answer}</p>
            </div>
            <div style={{ borderTop:"1px solid rgba(245,166,35,0.1)" }}>
              <button onClick={() => setShowSources(s => !s)} className="font-mono"
                style={{ width:"100%", padding:"12px 24px", background:"none", border:"none", color:"var(--text-faint)", fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:8 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" style={{ transition:"transform 0.2s", transform:showSources?"rotate(90deg)":"rotate(0deg)" }}>
                  <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                </svg>
                How this works · data sources consulted
              </button>
              {showSources && (
                <div style={{ padding:"0 24px 20px", borderTop:"1px solid rgba(245,166,35,0.08)" }}>
                  <p style={{ fontSize:"0.78rem", color:"var(--text-dim)", lineHeight:1.6, margin:"12px 0 14px" }}>The model received only these verified data tables. It cannot access the web, cannot hallucinate facts, and is instructed to refuse claims it cannot source.</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {result.sources.map((s,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:5, height:5, borderRadius:"50%", background:"var(--amber)", opacity:0.6 }} />
                        <span className="font-mono" style={{ fontSize:"0.68rem", color:"var(--text-dim)" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:14, padding:"10px 14px", background:"var(--ink-3)", border:"1px solid rgba(245,166,35,0.1)", borderRadius:2 }}>
                    <p className="font-mono" style={{ fontSize:"0.62rem", color:"var(--text-faint)", margin:0, lineHeight:1.6 }}>System constraint: "Only cite facts present in the provided data. If the answer is not in the data, say: That record isn't in the verified archive. Silence over fabrication."</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
