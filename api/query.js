import Anthropic from "@anthropic-ai/sdk";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const facts = require("../src/data/facts.json");



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
  const parts = [`LEAGUE META: ${JSON.stringify(facts.meta)}`];

  // Championships & titles
  if (/champion|title|won the most|who won|ring|trophy/.test(lq))
    parts.push(`CHAMPIONSHIPS: ${JSON.stringify(facts.championships)}`);

  // Blowouts
  if (/blowout|biggest|largest margin|destroy|demolish|massacre/.test(lq))
    parts.push(`BLOWOUTS HALL: ${JSON.stringify(facts.blowouts)}`);

  // Worst seasons
  if (/worst season|worst record|0-14|most losses|terrible/.test(lq))
    parts.push(`WORST SEASONS: ${JSON.stringify(facts.worst_seasons)}`);

  // Top player game scores
  if (/most point|highest score|best week|greatest game|best player|best fantasy|most ever|single game|single week|points in a|score ever|game ever/.test(lq))
    parts.push(`TOP PLAYER GAME SCORES: ${JSON.stringify(facts.top_player_games)}`);

  // Closest games
  if (/closest|narrowest|one point|tight|near miss|squeaker|close game|margin/.test(lq))
    parts.push(`CLOSEST GAMES: ${JSON.stringify(facts.closest_games)}`);

  // Highest team scores
  if (/highest team|most points in a week|best team score|highest score ever|200 points|team ever put up|score a team/.test(lq))
    parts.push(`HIGHEST TEAM SCORES: ${JSON.stringify(facts.highest_team_scores)}`);

  // Franchise season summaries
  if (/how did .+ do in|season record|points for|best season|season summary|ppg|per game|winning percentage|win pct|most points in a season|most season points|scored the most/.test(lq))
    parts.push(`FRANCHISE SEASONS: ${JSON.stringify(facts.franchise_seasons.slice(0,40))}`);

  // Head to head
  if (/head.to.head|record against|vs |versus|rivalry|all.time record|matchup history/.test(lq))
    parts.push(`HEAD TO HEAD: ${JSON.stringify(facts.head_to_head)}`);

  // FAAB / waiver bids
  if (/faab|waiver|pickup|bid|in.season|claimed/.test(lq))
    parts.push(`TOP FAAB BIDS: ${JSON.stringify(facts.top_faab_bids)}`);
  if (/bargain|value|best pickup|dollars per|per dollar|efficient/.test(lq))
    parts.push(`AUCTION BARGAINS: ${JSON.stringify(facts.draft.top_bargains)}`);

  // Bench / left on bench
  if (/bench|left on bench|should have started|wrong start|missed points/.test(lq))
    parts.push(`BEST BENCH SCORES: ${JSON.stringify(facts.best_bench_scores)}`);

  // Draft & auction
  if (/draft|auction|most expensive|bargain|bust|overpaid|underpaid/.test(lq))
    parts.push(`DRAFT & AUCTION: ${JSON.stringify(facts.draft)}`);

  // Franchise-specific lookups
  if (/brandon|bkb/.test(lq)) {
    parts.push(`BRANDON KNOWS BALL: ${JSON.stringify(facts.franchises["Brandon Knows Ball"])}`);
    parts.push(`WORST SEASONS (Brandon): ${JSON.stringify(facts.worst_seasons.filter(s=>s.franchise==="Brandon Knows Ball"))}`);
    parts.push(`BLOWOUTS (Brandon as loser): ${JSON.stringify(facts.blowouts.filter(b=>b.loser==="Brandon Knows Ball"))}`);
  }
  if (/paradis|playmakers|kp/.test(lq))
    parts.push(`PARADIS PLAYMAKERS: ${JSON.stringify(facts.franchises["Paradis' Playmakers"])}`);

  // Fallback — broad question, include key sections
  if (parts.length === 1) {
    parts.push(`CHAMPIONSHIPS: ${JSON.stringify(facts.championships)}`);
    parts.push(`TOP PLAYER GAMES: ${JSON.stringify(facts.top_player_games.slice(0,10))}`);
    parts.push(`BLOWOUTS: ${JSON.stringify(facts.blowouts.slice(0,5))}`);
    parts.push(`CLOSEST GAMES: ${JSON.stringify(facts.closest_games.slice(0,5))}`);
    parts.push(`WORST SEASONS: ${JSON.stringify(facts.worst_seasons.slice(0,5))}`);
    parts.push(`HEAD TO HEAD: ${JSON.stringify(facts.head_to_head.slice(0,10))}`);
  }

  // Safety: cap franchise_seasons everywhere to prevent token overflow
  const idx = parts.findIndex(p => p.startsWith('FRANCHISE SEASONS:'));
  if (idx !== -1) parts[idx] = `FRANCHISE SEASONS: ${JSON.stringify(facts.franchise_seasons.slice(0,40))}`;

  return parts.join("\n\n---\n\n");
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
