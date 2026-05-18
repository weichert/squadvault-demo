import { useState } from "react";
import facts from "../data/facts.json";

const TABS = ["Championship Roll","Blowouts Hall","Worst Seasons","Draft History"];

function ChampionshipRoll() {
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16, marginBottom:28 }}>
        {facts.championships.titles_by_franchise.filter(f=>f.titles>=3).map((f,i) => (
          <div key={f.franchise} style={{ background:i===0?"rgba(245,166,35,0.08)":"var(--ink-3)", border:i===0?"1px solid rgba(245,166,35,0.4)":"1px solid rgba(245,166,35,0.1)", borderRadius:2, padding:24 }}>
            {i===0 && <p className="section-label" style={{ marginBottom:8 }}>All-time leader</p>}
            <div className="stat-number" style={{ fontSize:"3rem", marginBottom:4 }}>{f.titles}</div>
            <div className="font-display" style={{ fontSize:"1rem", fontWeight:700, marginBottom:6 }}>{f.franchise}</div>
            <div className="font-mono" style={{ fontSize:"0.65rem", color:"var(--text-dim)" }}>{f.seasons.join(" · ")}</div>
          </div>
        ))}
      </div>
      <table className="vault-table"><thead><tr><th>Season</th><th>Champion</th><th>Runner-Up</th><th>Score</th><th>Margin</th></tr></thead>
        <tbody>{[...facts.championships.by_season].reverse().map(r => (
          <tr key={r.season}>
            <td className="hi">{r.season}</td>
            <td>{r.champion}</td>
            <td style={{ color:"var(--text-dim)" }}>{r.runner_up}</td>
            <td className="font-mono" style={{ color:"var(--text-dim)", fontSize:"0.7rem" }}>{r.champion_score.toFixed(2)} – {r.runner_up_score.toFixed(2)}</td>
            <td className="hi font-mono" style={{ fontSize:"0.7rem" }}>+{(r.champion_score-r.runner_up_score).toFixed(2)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function BlowoutsHall() {
  const top = facts.blowouts[0];
  return (
    <div>
      <div style={{ background:"rgba(245,166,35,0.06)", border:"1px solid rgba(245,166,35,0.3)", borderRadius:2, padding:28, marginBottom:24 }}>
        <p className="section-label" style={{ marginBottom:12 }}>All-time record — largest margin in 16 seasons</p>
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-end", gap:24 }}>
          <div>
            <div className="stat-number" style={{ fontSize:"3rem" }}>{top.margin.toFixed(2)}</div>
            <div className="font-mono" style={{ fontSize:"0.6rem", color:"var(--text-faint)", marginTop:4, letterSpacing:"0.1em" }}>point margin</div>
          </div>
          <div style={{ flex:1 }}>
            <div className="font-display" style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:4 }}>{top.winner}</div>
            <div className="font-mono" style={{ fontSize:"0.72rem", color:"var(--amber)" }}>{top.winner_score.toFixed(2)} pts</div>
            <div style={{ marginTop:8, color:"var(--text-dim)", fontSize:"0.85rem" }}>vs. {top.loser} ({top.loser_score.toFixed(2)} pts) · W{top.week} {top.season}</div>
          </div>
        </div>
      </div>
      <table className="vault-table"><thead><tr><th>#</th><th>Winner</th><th>Score</th><th>Loser</th><th>Score</th><th>Margin</th><th>When</th></tr></thead>
        <tbody>{facts.blowouts.map(r => (
          <tr key={r.rank}>
            <td className="dim">{r.rank}</td><td>{r.winner}</td>
            <td className="hi font-mono">{r.winner_score.toFixed(2)}</td>
            <td style={{ color:"var(--text-dim)" }}>{r.loser}</td>
            <td className="font-mono" style={{ color:"var(--text-faint)" }}>{r.loser_score.toFixed(2)}</td>
            <td className="hi font-mono">{r.margin.toFixed(2)}</td>
            <td className="dim font-mono">W{r.week} {r.season}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function WorstSeasons() {
  return (
    <div>
      <div style={{ background:"rgba(245,166,35,0.04)", border:"1px solid rgba(245,166,35,0.12)", borderRadius:2, padding:"14px 20px", marginBottom:20, color:"var(--text-dim)", fontSize:"0.82rem", lineHeight:1.6 }}>
        <span className="font-mono" style={{ color:"var(--amber)", fontSize:"0.6rem", letterSpacing:"0.1em" }}>NOTE — </span>
        14 games/season (2010–2020), 15 games/season (2021+). Win% and PPG are era-stable; absolute W-L records are not directly comparable across the 2021 format shift.
      </div>
      <table className="vault-table"><thead><tr><th>#</th><th>Franchise</th><th>Season</th><th>Record</th><th>Win%</th><th>PF</th><th>PPG</th></tr></thead>
        <tbody>{facts.worst_seasons.map(r => (
          <tr key={r.franchise+r.season}>
            <td className="dim">{r.rank}</td><td>{r.franchise}</td>
            <td className="hi">{r.season}</td>
            <td className="font-mono" style={{ color:r.record==="0-14"?"#ef4444":"var(--text-dim)", fontWeight:r.record==="0-14"?500:400 }}>{r.record}</td>
            <td className="font-mono" style={{ color:"var(--text-faint)" }}>{(r.win_pct*100).toFixed(1)}%</td>
            <td className="font-mono" style={{ color:"var(--text-dim)" }}>{r.points_for.toFixed(2)}</td>
            <td className="font-mono" style={{ color:"var(--text-dim)" }}>{r.ppg.toFixed(2)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function DraftHistory() {
  const [view, setView] = useState("bargains");
  return (
    <div>
      <div style={{ background:"rgba(245,166,35,0.06)", border:"1px solid rgba(245,166,35,0.25)", borderRadius:2, padding:"18px 24px", marginBottom:20 }}>
        <p className="section-label" style={{ marginBottom:6 }}>Overall record — most expensive single pick · {facts.draft.auction_era}</p>
        <span className="font-display" style={{ fontSize:"1.5rem", fontWeight:700, color:"var(--amber)" }}>${facts.draft.overall_record.bid}</span>
        <span style={{ marginLeft:12, fontSize:"1rem" }}>{facts.draft.overall_record.player} ({facts.draft.overall_record.position})</span>
        <span style={{ marginLeft:8, color:"var(--text-dim)", fontSize:"0.85rem" }}>— {facts.draft.overall_record.franchise}, {facts.draft.overall_record.season}</span>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["bargains","busts","positions"].map(v => (
          <button key={v} onClick={() => setView(v)} className="font-mono" style={{ fontSize:"0.65rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"7px 14px", border:"1px solid", borderColor:view===v?"var(--amber)":"rgba(245,166,35,0.2)", background:view===v?"rgba(245,166,35,0.1)":"transparent", color:view===v?"var(--amber)":"var(--text-dim)", cursor:"pointer", borderRadius:2 }}>{v}</button>
        ))}
      </div>
      {view==="bargains" && <table className="vault-table"><thead><tr><th>#</th><th>Player</th><th>Franchise</th><th>Bid</th><th>Total Pts</th><th>$/pt</th><th>Season</th></tr></thead>
        <tbody>{facts.draft.top_bargains.map(r => (<tr key={r.rank}><td className="dim">{r.rank}</td><td>{r.player}</td><td style={{ color:"var(--text-dim)" }}>{r.franchise}</td><td className="hi font-mono">${r.bid}</td><td className="font-mono" style={{ color:"var(--text-dim)" }}>{r.total_points}</td><td className="font-mono" style={{ color:"#22c55e" }}>${r.per_point.toFixed(3)}</td><td className="dim">{r.season}</td></tr>))}</tbody></table>}
      {view==="busts" && <table className="vault-table"><thead><tr><th>#</th><th>Player</th><th>Franchise</th><th>Bid</th><th>Avg/Wk</th><th>Lg Avg</th><th>Season</th></tr></thead>
        <tbody>{facts.draft.top_busts.map(r => (<tr key={r.rank}><td className="dim">{r.rank}</td><td>{r.player}</td><td style={{ color:"var(--text-dim)" }}>{r.franchise}</td><td className="font-mono" style={{ color:"#ef4444" }}>${r.bid}</td><td className="font-mono" style={{ color:"var(--text-faint)" }}>{r.player_avg}</td><td className="font-mono" style={{ color:"var(--text-dim)" }}>{r.league_avg}</td><td className="dim">{r.season}</td></tr>))}</tbody></table>}
      {view==="positions" && <table className="vault-table"><thead><tr><th>Position</th><th>Player</th><th>Franchise</th><th>Bid</th><th>Season</th></tr></thead>
        <tbody>{facts.draft.position_records.map(r => (<tr key={r.position}><td className="hi">{r.position}</td><td>{r.player}</td><td style={{ color:"var(--text-dim)" }}>{r.franchise}</td><td className="hi font-mono">${r.bid}</td><td className="dim">{r.season}</td></tr>))}</tbody></table>}
    </div>
  );
}

export default function ArchiveBrowser() {
  const [tab, setTab] = useState(0);
  const Panels = [ChampionshipRoll, BlowoutsHall, WorstSeasons, DraftHistory];
  const Panel = Panels[tab];
  return (
    <section id="archive" style={{ background:"var(--ink-2)", borderBottom:"1px solid rgba(245,166,35,0.1)", padding:"80px 0" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 32px" }}>
        <p className="section-label" style={{ marginBottom:12 }}>Digital Archive · 16 seasons · 2010–2025</p>
        <h2 className="font-display" style={{ fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:900, marginBottom:12 }}>The Record Books</h2>
        <p style={{ color:"var(--text-dim)", fontSize:"0.95rem", marginBottom:36, maxWidth:520, lineHeight:1.6 }}>Every number sourced directly from the canonical event ledger. No approximations. No estimates.</p>
        <div style={{ borderBottom:"1px solid rgba(245,166,35,0.15)", marginBottom:28, display:"flex" }}>
          {TABS.map((label,i) => (
            <button key={i} onClick={() => setTab(i)} className="font-mono" style={{ fontSize:"0.68rem", letterSpacing:"0.12em", textTransform:"uppercase", padding:"12px 20px", background:"none", border:"none", borderBottom:tab===i?"2px solid var(--amber)":"2px solid transparent", color:tab===i?"var(--amber)":"var(--text-faint)", cursor:"pointer", marginBottom:"-1px" }}>{label}</button>
          ))}
        </div>
        <Panel />
      </div>
    </section>
  );
}
