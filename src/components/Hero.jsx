import { useState, useEffect } from "react";

const STATS = [
  { value: "16", label: "Seasons" },
  { value: "1,182", label: "Matchups" },
  { value: "32,649", label: "Player scores" },
  { value: "~40", label: "Years running" },
];

export default function Hero() {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section style={{ background:"var(--ink)", borderBottom:"1px solid rgba(245,166,35,0.12)", minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"space-between", overflow:"hidden", position:"relative" }}>
      <div style={{ position:"absolute", top:"-20%", right:"-10%", width:600, height:600, background:"radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />

      <nav style={{ borderBottom:"1px solid rgba(245,166,35,0.1)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 32px", position:"relative", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:26, height:26, background:"var(--amber)", clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
          <span className="font-display" style={{ fontSize:"1rem", fontWeight:700, letterSpacing:"0.05em" }}>SquadVault</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          {["Archive","Query","Architecture"].map(item => (
            <a key={item} href={"#"+item.toLowerCase()} className="font-mono" style={{ color:"var(--text-dim)", fontSize:"0.68rem", letterSpacing:"0.15em", textTransform:"uppercase", textDecoration:"none" }}>{item}</a>
          ))}
          <a href="https://github.com/weichert/squadvault" target="_blank" rel="noopener noreferrer" className="font-mono" style={{ color:"var(--amber)", fontSize:"0.68rem", letterSpacing:"0.15em", textTransform:"uppercase", textDecoration:"none", border:"1px solid rgba(245,166,35,0.4)", padding:"5px 12px", borderRadius:2 }}>GitHub</a>
        </div>
      </nav>

      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"48px 64px", position:"relative", zIndex:10, opacity: vis?1:0, transform: vis?"none":"translateY(20px)", transition:"opacity 0.7s ease, transform 0.7s ease" }}>
        <p className="section-label" style={{ marginBottom:20 }}>PFL Buddies · Est. 1983 · Digital archive 2010–2025</p>
        <h1 className="font-display" style={{ fontSize:"clamp(2.8rem,7vw,6rem)", fontWeight:900, lineHeight:1.0, marginBottom:"2rem", maxWidth:900 }}>
          16 seasons.<br /><span style={{ color:"var(--amber)" }}>Every fact</span><br />verified.
        </h1>
        <div style={{ maxWidth:560, marginBottom:"2.5rem" }}>
          <p style={{ fontSize:"1.05rem", color:"var(--text-dim)", lineHeight:1.7, marginBottom:"1.25rem", fontWeight:300 }}>
            AI sports narrative has a fabrication problem. Scores drift. Records get invented. Statistics get cited that don't exist. SquadVault was built to solve this — for one specific league that has been running since 1983.
          </p>
          <p style={{ fontSize:"1.05rem", color:"var(--text-dim)", lineHeight:1.7, fontWeight:300 }}>
            Facts are immutable and append-only. Narratives are derived, never fact-creating. Every claim passes 15 automated verification checks before a commissioner can approve it for publication. <span style={{ color:"var(--text)" }}>Silence is preferred over speculation.</span>
          </p>
        </div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <a href="#query" style={{ background:"var(--amber)", color:"var(--ink)", fontFamily:"'IBM Plex Mono',monospace", fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", textDecoration:"none", padding:"13px 24px", fontWeight:500, borderRadius:2 }}>Query the vault →</a>
          <a href="#archive" style={{ color:"var(--text-dim)", fontFamily:"'IBM Plex Mono',monospace", fontSize:"0.75rem", letterSpacing:"0.12em", textTransform:"uppercase", textDecoration:"none", padding:"13px 24px", border:"1px solid rgba(245,166,35,0.2)", borderRadius:2 }}>Browse the archive</a>
        </div>
      </div>

      <div style={{ borderTop:"1px solid rgba(245,166,35,0.12)", background:"rgba(0,0,0,0.3)", display:"grid", gridTemplateColumns:"repeat(4,1fr)", opacity: vis?1:0, transition:"opacity 0.7s ease 0.3s" }}>
        {STATS.map((s,i) => (
          <div key={i} style={{ padding:"24px 32px", borderRight: i<3?"1px solid rgba(245,166,35,0.08)":"none" }}>
            <div className="stat-number" style={{ fontSize:"2.5rem", marginBottom:4 }}>{s.value}</div>
            <div className="font-mono" style={{ fontSize:"0.6rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--text-faint)" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
