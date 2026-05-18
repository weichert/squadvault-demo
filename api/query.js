import Anthropic from "@anthropic-ai/sdk";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const facts = require("./facts.json");



const SYSTEM_PROMPT = `You are the SquadVault record engine. PFL Buddies fantasy football, 16 seasons (2010-2025), founded 1983.

RULES - non-negotiable:
1. Only cite facts present in the provided data. Never invent or extrapolate.
2. If the answer is not in the data, say exactly: "That record isn't in the verified archive."
3. State verified facts with confidence. No hedging. No speculation.
4. 2-4 sentences max. Direct and authoritative.
5. Write like a record being pulled from a vault, not a chatbot.
6. Always cite season, week, or franchise name when relevant.`;

function buildContext(q) {
  const lq = q.toLowerCase();
  const sections = [`LEAGUE META: ${JSON.stringify(facts.meta)}`];

  const has = (...words) => words.some(w => lq.includes(w));

  if (has('champion','title','won the most','who won','ring','most wins'))
    sections.push(`CHAMPIONSHIPS: ${JSON.stringify(facts.championships)}`);

  if (has('blowout','biggest','largest margin','demolish','massacre','worst beating','worst loss'))
    sections.push(`BLOWOUTS: ${JSON.stringify(facts.blowouts)}`);

  if (has('worst season','worst record','0-14','most losses','terrible season'))
    sections.push(`WORST SEASONS: ${JSON.stringify(facts.worst_seasons)}`);

  if (has('most points in a game','highest score','best week','greatest game','best player','most ever scored','single game','single week','points in a game','score ever','game ever','points ever','scored the most in a game','most points a player'))
    sections.push(`TOP PLAYER GAME SCORES: ${JSON.stringify(facts.top_player_games)}`);

  if (has('closest','tightest','narrowest','one point','near miss','squeaker','close game','tied','tie game'))
    sections.push(`CLOSEST GAMES: ${JSON.stringify(facts.closest_games)}`);

  if (has('highest score a team','team ever put up','highest team score','most points in a week','best team score','team scored in a week','200 points'))
    sections.push(`HIGHEST TEAM SCORES: ${JSON.stringify(facts.highest_team_scores)}`);

  if (has('winning percentage','win percentage','win pct','all-time record','best record','most wins all','most season points','most points in a season','most points in a single season','scored the most points in a single','which team scored'))
    sections.push(`FRANCHISE SEASON SUMMARIES (top 40 by scoring): ${JSON.stringify(facts.franchise_seasons.slice(0,40))}`);

  if (has('how did','do in 20','season record','season summary','ppg','per game','points for','best season','worst season for'))
    sections.push(`FRANCHISE SEASON SUMMARIES: ${JSON.stringify(facts.franchise_seasons.slice(0,40))}`);

  if (has('head to head','record against','vs ','versus','rivalry','all-time record against','matchup history','beats','beat'))
    sections.push(`HEAD TO HEAD RECORDS: ${JSON.stringify(facts.head_to_head)}`);

  if (has('faab','waiver','pickup','in-season bid','claimed','waivers'))
    sections.push(`TOP FAAB BIDS: ${JSON.stringify(facts.top_faab_bids)}`);

  if (has('bargain','value pick','dollars per point','per dollar','most efficient','best pickup for dollar'))
    sections.push(`AUCTION BARGAINS: ${JSON.stringify(facts.draft.top_bargains)}`);

  if (has('bench','left on bench','should have started','wrong start','missed points','sitting on bench','on the bench'))
    sections.push(`BEST BENCH SCORES: ${JSON.stringify(facts.best_bench_scores)}`);

  if (has('draft','auction','most expensive','bust','overpaid','underpaid','paid for','bid on'))
    sections.push(`DRAFT & AUCTION: ${JSON.stringify(facts.draft)}`);

  if (has('brandon','bkb','brandon knows ball')) {
    sections.push(`BRANDON KNOWS BALL: ${JSON.stringify(facts.franchises["Brandon Knows Ball"])}`);
    sections.push(`BRANDON WORST SEASONS: ${JSON.stringify(facts.worst_seasons.filter(s=>s.franchise==="Brandon Knows Ball"))}`);
    sections.push(`BRANDON BLOWOUT LOSSES: ${JSON.stringify(facts.blowouts.filter(b=>b.loser==="Brandon Knows Ball"))}`);
  }

  if (has('paradis','playmakers')) {
    sections.push(`PARADIS PLAYMAKERS: ${JSON.stringify(facts.franchises["Paradis' Playmakers"])}`);
    sections.push(`CHAMPIONSHIPS: ${JSON.stringify(facts.championships)}`);
  }

  // Fallback for unmatched queries
  if (sections.length === 1) {
    sections.push(`CHAMPIONSHIPS: ${JSON.stringify(facts.championships)}`);
    sections.push(`TOP PLAYER GAMES: ${JSON.stringify(facts.top_player_games.slice(0,10))}`);
    sections.push(`BLOWOUTS: ${JSON.stringify(facts.blowouts.slice(0,5))}`);
    sections.push(`CLOSEST GAMES: ${JSON.stringify(facts.closest_games.slice(0,5))}`);
    sections.push(`WORST SEASONS: ${JSON.stringify(facts.worst_seasons.slice(0,5))}`);
  }

  return sections.join("\n\n---\n\n");
}


export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { question } = req.body || {};
  if (!question?.trim()) return res.status(400).json({ error: "No question provided" });
  if (question.length > 500) return res.status(400).json({ error: "Question too long" });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const context = buildContext(question);
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `VERIFIED DATA:\n${context}\n\nQUESTION: ${question}` }],
    });

    const sources = [];
    if (context.includes("CHAMPIONSHIPS")) sources.push("Championship records (2010-2025)");
    if (context.includes("BLOWOUTS")) sources.push("Blowouts hall (top 10 all-time)");
    if (context.includes("WORST SEASONS")) sources.push("Worst season records");
    if (context.includes("DRAFT")) sources.push("Auction draft data (2018-2025)");

    return res.status(200).json({ answer: message.content[0].text, sources, verified: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Engine error. The vault is temporarily unavailable." });
  }
}

