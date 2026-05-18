const PIPELINE = [
  { label:"MFL Platform",     desc:"8 league IDs, 16 seasons, ~12 req/min rate-limited" },
  { label:"Platform Adapter", desc:"History-chain resolution → canonical league ID 70985" },
  { label:"Ingest Layer",     desc:"Append-only event ledger. SQLite. No overwrites." },
  { label:"Canonical Events", desc:"1,182 matchups · 32,649 player scores · FAAB ledger" },
  { label:"Signal Scout",     desc:"11 trend detectors · 2-tier evidence gate" },
  { label:"Writer's Room",    desc:"Governed expressive output · Voice Profile bound" },
  { label:"Verifier",         desc:"15 automated checks · SCORE · SUPERLATIVE · STREAK", highlight:"verified" },
  { label:"Commissioner",     desc:"Human review & approval gate. Cannot be bypassed.", highlight:"amber" },
  { label:"Distribution",     desc:"Approved artifact → league delivery" },
];

const STATS = [
  ["2,308","Tests passing"],["32,649","Player scores"],["16","Seasons"],["1,182","Matchups"],
  ["15","Verifier checks"],["11","Signal detectors"],["18","Approved recaps"],["~40","Years of history"],
];

const PRINCIPLES = [
  { title:"Facts are immutable",     body:"The event ledger is append-only. No record is ever overwritten. Raw platform data is preserved permanently alongside canonicalized versions." },
  { title:"Narratives are derived",  body:"Every sentence in a published recap is grounded in canonical events. The AI cannot create facts — it can only render them." },
  { title:"Silence over speculation",body:"If a claim cannot be verified against the canonical ledger, it is omitted. The verifier hard-fails unverifiable assertions." },
  { title:"Humans approve",          body:"No recap is published without commissioner review. The CLI workflow will become a web UX; the gate itself is non-negotiable." },
];

export default function Architecture() {
  return (
    <section id="architecture" style={{ background:"var(--ink-2)", padding:"80px 0 100px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 32px" }}>
        <p className="section-label" style={{ marginBottom:12 }}>Technical architecture · Phase 10 frozen</p>
        <h2 className="font-display" style={{ fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:900, marginBottom:12 }}>How the engine works</h2>
        <p style={{ color:"var(--text-dim)", fontSize:"0.95rem", marginBottom:52, maxWidth:560, lineHeight:1.6 }}>The substrate layer is frozen. Governance is the product. Every architectural choice is a consequence of the integrity discipline.</p>

        <p className="section-label" style={{ marginBottom:20 }}>Processing pipeline</p>
        <div style={{ display:"flex", flexDirection:"column", marginBottom:56 }}>
          {PIPELINE.map((step,i) => (
            <div key={i} style={{ display:"flex", alignItems:"stretch" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:36, flexShrink:0 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:step.highlight==="verified"?"#22c55e":step.highlight==="amber"?"var(--amber)":"rgba(245,166,35,0.4)", border:"2px solid", borderColor:step.highlight==="verified"?"#22c55e":step.highlight==="amber"?"var(--amber)":"rgba(245,166,35,0.3)", marginTop:16, flexShrink:0 }} />
                {i < PIPELINE.length-1 && <div style={{ flex:1, width:1, background:"rgba(245,166,35,0.15)", minHeight:20 }} />}
              </div>
              <div style={{ flex:1, padding:"12px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:3 }}>
                  <span className="font-display" style={{ fontSize:"0.95rem", fontWeight:700, color:step.highlight==="verified"?"#22c55e":step.highlight==="amber"?"var(--amber)":"var(--text)" }}>{step.label}</span>
                  {step.highlight==="verified" && <span className="badge-verified" style={{ fontSize:"0.55rem" }}>15 checks</span>}
                  {step.highlight==="amber" && <span className="font-mono" style={{ fontSize:"0.55rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--amber)", border:"1px solid rgba(245,166,35,0.3)", padding:"2px 7px", borderRadius:2 }}>Required gate</span>}
                </div>
                <p className="font-mono" style={{ fontSize:"0.67rem", color:"var(--text-faint)", margin:0 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="section-label" style={{ marginBottom:20 }}>By the numbers</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", border:"1px solid rgba(245,166,35,0.12)", borderRadius:2, overflow:"hidden", marginBottom:52 }}>
          {STATS.map(([val,label],i) => (
            <div key={i} style={{ padding:"22px 20px", borderRight:"1px solid rgba(245,166,35,0.08)", borderBottom:"1px solid rgba(245,166,35,0.08)" }}>
              <div className="stat-number" style={{ fontSize:"1.9rem", marginBottom:6 }}>{val}</div>
              <div className="font-mono" style={{ fontSize:"0.6rem", letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-faint)" }}>{label}</div>
            </div>
          ))}
        </div>

        <p className="section-label" style={{ marginBottom:20 }}>Core principles — non-negotiable</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16, marginBottom:52 }}>
          {PRINCIPLES.map((p,i) => (
            <div key={i} style={{ padding:"22px 24px", border:"1px solid rgba(245,166,35,0.12)", background:"rgba(245,166,35,0.02)", borderRadius:2 }}>
              <h4 className="font-display" style={{ fontSize:"0.95rem", fontWeight:700, color:"var(--amber)", marginBottom:10, marginTop:0 }}>{p.title}</h4>
              <p style={{ fontSize:"0.85rem", color:"var(--text-dim)", lineHeight:1.65, margin:0 }}>{p.body}</p>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:36, borderTop:"1px solid rgba(245,166,35,0.12)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
          <div>
            <div className="font-display" style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:6 }}>Built by Steve Weichert</div>
            <p className="font-mono" style={{ fontSize:"0.65rem", color:"var(--text-faint)", letterSpacing:"0.1em", margin:0 }}>Sole developer · 16 seasons · Python · SQLite · Anthropic API</p>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <a href="https://github.com/weichert/squadvault" target="_blank" rel="noopener noreferrer" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.12em", textTransform:"uppercase", textDecoration:"none", padding:"11px 20px", border:"1px solid rgba(245,166,35,0.35)", color:"var(--amber)", borderRadius:2 }}>View repo →</a>
            <a href="#query" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.12em", textTransform:"uppercase", textDecoration:"none", padding:"11px 20px", background:"var(--amber)", color:"var(--ink)", fontWeight:500, borderRadius:2 }}>Try the demo</a>
          </div>
        </div>
      </div>
    </section>
  );
}
