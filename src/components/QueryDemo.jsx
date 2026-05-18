import { useState } from "react";

const SUGGESTED = [
  "Who has won the most championships?",
  "What's the closest game in league history?",
  "How did Brandon do in 2025?",
  "Who had the most points in a game ever?",
];

export default function QueryDemo() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  async function runQuery(q) {
    const text = q || question;
    if (!text.trim()) return;
    setLoading(true); setResult(null); setError(null);
    setShowSources(false); setShowSQL(false);
    setQuestion(text);

    try {
      // Layer 1 — facts snapshot
      const r1 = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(d1.error || "Vault unavailable");

      const isNotFound = d1.answer?.toLowerCase().includes("isn't in the verified archive");

      if (!isNotFound) {
        setResult({ ...d1, layer: 1 });
        return;
      }

      // Layer 2 — text-to-SQL fallback
      const r2 = await fetch("/api/query_layer2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const d2 = await r2.json();
      if (!r2.ok) throw new Error(d2.error || "Vault unavailable");
      setResult({ ...d2, layer: 2 });

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
        <p style={{ color:"var(--text-dim)", fontSize:"0.95rem", marginBottom:32, lineHeight:1.6 }}>
          Every answer is grounded in verified data. The model receives only canonical facts — it cannot fabricate. If a record isn't in the snapshot, the engine queries the live ledger directly.
        </p>

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
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key==="Enter" && !loading && runQuery()}
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

            {/* Header */}
            <div style={{ padding:"14px 24px", borderBottom:"1px solid rgba(245,166,35,0.15)", display:"flex", alignItems:"center", gap:12, background:"rgba(245,166,35,0.04)", flexWrap:"wrap" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e" }} />
              <span className="badge-verified">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3.5" stroke="currentColor"/><path d="M2.5 4l1 1 2-2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/></svg>
                Verified · 16 seasons · canonical data
              </span>
              <span className="font-mono" style={{ fontSize:"0.6rem", color:"var(--text-faint)", letterSpacing:"0.1em", marginLeft:"auto" }}>
                {result.layer === 2 ? "Layer 2 · live ledger query" : "Layer 1 · snapshot"}
              </span>
            </div>

            {/* Answer */}
            <div style={{ padding:"28px 24px" }}>
              <p style={{ fontSize:"1.05rem", lineHeight:1.75, fontWeight:300, margin:0 }}>{result.answer}</p>
            </div>

            {/* Collapsibles */}
            <div style={{ borderTop:"1px solid rgba(245,166,35,0.1)" }}>

              {/* How this works */}
              <button onClick={() => setShowSources(s => !s)} className="font-mono"
                style={{ width:"100%", padding:"12px 24px", background:"none", border:"none", color:"var(--text-faint)", fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:8 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" style={{ transition:"transform 0.2s", transform:showSources?"rotate(90deg)":"rotate(0deg)" }}>
                  <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                </svg>
                How this works · {result.layer === 2 ? "SQL query used" : "data sources consulted"}
              </button>

              {showSources && (
                <div style={{ padding:"0 24px 20px", borderTop:"1px solid rgba(245,166,35,0.08)" }}>
                  {result.layer === 1 ? (
                    <>
                      <p style={{ fontSize:"0.78rem", color:"var(--text-dim)", lineHeight:1.6, margin:"12px 0 14px" }}>
                        The model received only these verified data tables from the pre-built snapshot. It cannot access the web, cannot hallucinate facts, and is instructed to refuse claims it cannot source.
                      </p>
                      {(result.sources||[]).map((s,i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                          <div style={{ width:5, height:5, borderRadius:"50%", background:"var(--amber)", opacity:0.6 }} />
                          <span className="font-mono" style={{ fontSize:"0.68rem", color:"var(--text-dim)" }}>{s}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize:"0.78rem", color:"var(--text-dim)", lineHeight:1.6, margin:"12px 0 14px" }}>
                        The snapshot didn't cover this question. The engine generated a SQL query against the read-only canonical ledger ({result.row_count} row{result.row_count !== 1 ? "s" : ""} returned).
                      </p>
                      {result.sql && (
                        <div style={{ background:"var(--ink-3)", border:"1px solid rgba(245,166,35,0.15)", borderRadius:2, padding:"12px 16px", marginBottom:12 }}>
                          <p className="font-mono" style={{ fontSize:"0.68rem", color:"var(--amber)", margin:"0 0 6px", letterSpacing:"0.08em" }}>GENERATED SQL</p>
                          <pre style={{ margin:0, fontSize:"0.7rem", color:"var(--text-dim)", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{result.sql}</pre>
                        </div>
                      )}
                      <button onClick={() => setShowSQL(s => !s)} className="font-mono"
                        style={{ fontSize:"0.62rem", letterSpacing:"0.1em", textTransform:"uppercase", background:"none", border:"1px solid rgba(245,166,35,0.15)", color:"var(--text-faint)", padding:"6px 12px", cursor:"pointer", borderRadius:2, marginTop:4 }}>
                        {showSQL ? "Hide" : "Show"} raw results ({result.row_count} rows)
                      </button>
                      {showSQL && result.rows?.length > 0 && (
                        <div style={{ marginTop:10, overflowX:"auto" }}>
                          <table className="vault-table">
                            <thead><tr>{Object.keys(result.rows[0]).map(k => <th key={k}>{k}</th>)}</tr></thead>
                            <tbody>{result.rows.slice(0,10).map((row,i) => (
                              <tr key={i}>{Object.values(row).map((v,j) => <td key={j} style={{ fontSize:"0.68rem" }}>{String(v ?? "")}</td>)}</tr>
                            ))}</tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ marginTop:14, padding:"10px 14px", background:"var(--ink-3)", border:"1px solid rgba(245,166,35,0.1)", borderRadius:2 }}>
                    <p className="font-mono" style={{ fontSize:"0.62rem", color:"var(--text-faint)", margin:0, lineHeight:1.6 }}>
                      {result.layer === 2
                        ? "Governance constraint: SELECT only. Read-only ledger. No writes. No external data. Results rendered by Claude from verified rows."
                        : 'Governance constraint: "Only cite facts present in the provided data. Silence over fabrication."'}
                    </p>
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
