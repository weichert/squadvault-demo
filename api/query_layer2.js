import Anthropic from "@anthropic-ai/sdk";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load better-sqlite3 for synchronous DB access
let Database;
try {
  Database = require("better-sqlite3");
} catch {
  Database = null;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCHEMA = `
Tables available for SELECT queries only:

matchups (season, week, winner_name, winner_score, loser_name, loser_score, margin)
  - One row per game. margin = winner_score - loser_score (always positive).
  - Example: SELECT * FROM matchups WHERE season = 2025 ORDER BY margin DESC LIMIT 5

player_scores (season, week, player_name, position, franchise_name, score, is_starter)
  - One row per player per week. is_starter: 1 = started, 0 = bench.
  - Positions: QB, RB, WR, TE, PK, Def (team defenses)
  - Example: SELECT player_name, score FROM player_scores WHERE is_starter=1 ORDER BY score DESC LIMIT 10

draft_picks (season, player_name, position, franchise_name, bid_amount)
  - Auction era only: 2018-2025 (2021 missing from substrate)
  - Example: SELECT * FROM draft_picks ORDER BY bid_amount DESC LIMIT 5

franchise_records (franchise_name, all_time_wins, all_time_losses, all_time_games, win_pct)
  - One row per franchise. Cumulative all-time records across digital era.
  - Example: SELECT * FROM franchise_records ORDER BY win_pct DESC

Constraints you MUST follow:
- SELECT only. Never INSERT, UPDATE, DELETE, DROP, or any write operation.
- Always include LIMIT (max 50).
- Use exact column names above. No aliases not in schema.
- For name searches use LIKE with % wildcards: WHERE player_name LIKE '%Mahomes%'
- Seasons range: 2010-2025. Weeks range: 1-18.
`;

const SQL_SYSTEM = `You are a SQL generator for a fantasy football database. Given a natural language question, output ONLY a valid SQLite SELECT query and nothing else. No explanation, no markdown, no backticks. Just the raw SQL statement ending with a semicolon.

${SCHEMA}

If the question cannot be answered with a SQL query against these tables, output exactly: CANNOT_QUERY`;

const RENDER_SYSTEM = `You are the SquadVault record engine. PFL Buddies fantasy football, 16 seasons (2010-2025), founded 1983.
Given a SQL query result, render the answer as 2-4 plain sentences. No markdown, no bold, no asterisks.
State facts with confidence. Cite season, week, franchise name when relevant.
If results are empty, say: That record isn't in the verified archive.`;

function openDb() {
  const dbPath = path.join(__dirname, "query_db.sqlite");
  return new Database(dbPath, { readonly: true });
}

function isSafeQuery(sql) {
  const upper = sql.toUpperCase().trim();
  if (!upper.startsWith("SELECT")) return false;
  const forbidden = ["INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "ATTACH", "PRAGMA"];
  return !forbidden.some(kw => upper.includes(kw));
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

  if (!Database) {
    return res.status(500).json({ error: "Database driver unavailable." });
  }

  try {
    // Step 1: Generate SQL
    const sqlResponse = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SQL_SYSTEM,
      messages: [{ role: "user", content: question }],
    });

    const sql = sqlResponse.content[0].text.trim();

    if (sql === "CANNOT_QUERY") {
      return res.status(200).json({
        answer: "That record isn't in the verified archive.",
        sql: null,
        rows: [],
        layer: 2,
      });
    }

    if (!isSafeQuery(sql)) {
      return res.status(400).json({ error: "Query rejected by safety gate." });
    }

    // Step 2: Execute SQL
    const db = openDb();
    let rows;
    try {
      rows = db.prepare(sql).all();
    } finally {
      db.close();
    }

    // Step 3: Render answer
    const renderResponse = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: RENDER_SYSTEM,
      messages: [{
        role: "user",
        content: `QUESTION: ${question}\n\nSQL USED: ${sql}\n\nRESULTS (${rows.length} rows): ${JSON.stringify(rows.slice(0, 20), null, 2)}`
      }],
    });

    return res.status(200).json({
      answer: renderResponse.content[0].text,
      sql,
      rows: rows.slice(0, 20),
      row_count: rows.length,
      layer: 2,
      verified: true,
    });

  } catch (err) {
    console.error("Layer 2 error:", err);
    return res.status(500).json({ error: "Engine error. The vault is temporarily unavailable." });
  }
}
