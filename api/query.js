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
  const parts = [`LEAGUE: ${JSON.stringify(facts.meta)}`];
  if (/champion|title|win|most|who has|who won/.test(lq))
    parts.push(`CHAMPIONSHIPS: ${JSON.stringify(facts.championships)}`);
  if (/blowout|biggest|margin|destroy/.test(lq))
    parts.push(`BLOWOUTS: ${JSON.stringify(facts.blowouts)}`);
  if (/worst season|0-14|worst record/.test(lq))
    parts.push(`WORST SEASONS: ${JSON.stringify(facts.worst_seasons)}`);
  if (/brandon|bkb/.test(lq)) {
    parts.push(`BRANDON KNOWS BALL: ${JSON.stringify(facts.franchises["Brandon Knows Ball"])}`);
    parts.push(`WORST SEASONS: ${JSON.stringify(facts.worst_seasons.slice(0,3))}`);
    parts.push(`BLOWOUTS (as loser): ${JSON.stringify(facts.blowouts.filter(b=>b.loser==="Brandon Knows Ball"))}`);
  }
  if (/paradis|playmakers/.test(lq))
    parts.push(`PARADIS: ${JSON.stringify(facts.franchises["Paradis' Playmakers"])}`);
  if (/draft|auction|bid|bargain|bust|expensive|barkley|mahomes|lamar/.test(lq))
    parts.push(`DRAFT: ${JSON.stringify(facts.draft)}`);
  if (parts.length === 1) {
    parts.push(`CHAMPIONSHIPS: ${JSON.stringify(facts.championships)}`);
    parts.push(`BLOWOUTS: ${JSON.stringify(facts.blowouts.slice(0,5))}`);
    parts.push(`WORST SEASONS: ${JSON.stringify(facts.worst_seasons.slice(0,3))}`);
  }
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
