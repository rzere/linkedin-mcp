# linkedin-mcp

[![Apex MCP — featured on mcpexplorer.com](https://mcpexplorer.com/badge/apex.svg)](https://mcpexplorer.com/mcps/apex)

**Governed LinkedIn hands for AI agents.** This is the public face of [Apex by LeadShark](https://www.apex.new) — an MCP loadout that lets Claude, ChatGPT, or Cursor operate a real LinkedIn account in plain English: find buyers, rank intent, comment, connect, and message. Every action is paced, capped, approval-queued where needed, and fully logged.

This repo contains the **discovery endpoint** — a minimal, dependency-free MCP server, served live at:

- **`https://www.apex.new/mcp`** (alias: `https://www.apex.new/linkedin-mcp`)

Mount it in any MCP host and it completes the handshake instantly — no account, no auth — then briefs your agent on what the full loadout is and how to get it.

## The mission

Most LinkedIn tooling automates what you already decided: schedule this post, DM whoever comments. Apex is the layer above that — the **intelligence that decides what to automate and where to show up**. The activation path is intelligence-first, not automation-first. In five words:

> **Discover demand. Engage with context.**

An agent running Apex works a loop: **See → Decide → Act.** Find the posts and people where attention already is, figure out who's worth engaging and with what angle, then engage — inside the account's safety budget.

## The loadout — 36 tools, See → Decide → Act

The full authenticated server at `https://apex.leadshark.io/mcp` equips your agent with:

### See / discover — where is the demand?
`search` · `discover_lead_magnets` · `list_signals` · `feed` · `list_recent_posts` · `list_person_posts` · `list_post_engagers` · `get_person_activity`

Find people and companies, pull a continuously refreshed radar of prospect-rich lead-magnet posts, list your heat-scored inbound signals, turn one viral post into a warm lead list, and see the rooms a prospect is already in (`get_person_activity` — who they comment on, what they react to).

### Decide / context — who is worth your time?
`enrich` · `enrich_company` · `get_lead_activity`

Structured profiles for a person or account: role, company, activity, connections. The agent ranks ICP fit and intent and picks the angle — comment, connect, or ignore. Built on `enrich`, the most-used signal in the loadout.

### Act — engagement
`comment_on_post` · `react_to_post` · `send_connection_request` · `engage_with_comment` · `manage_invitations`

Show up where the prospect's attention already is — warm them up in public before anything lands in their inbox. Triage inbound connection requests too.

### Act — messaging
`list_recent_messages` · `get_messages_with_person` · `send_message`

Read the inbox, pull a full thread with one person, send the DM — deduped, paced, and logged.

### Company Pages (Pro+ baseline)
`list_companies` · `comment_as_company` · `react_as_company`

Engage in your Company Page's voice on pages you administer.

### Automations & scheduled posts (Pro+ baseline)
`create_automation` · `list_automations` · `get_automation` · `edit_automation` · `suggest_automation_settings` · `schedule_post_with_automation` · `list_scheduled_posts` · `get_scheduled_post` · `edit_scheduled_post` · `cancel_scheduled_post`

The execution layer: comment→DM lead-magnet automations and pre-automated post scheduling. Apex decides *what* to run; these run it.

### Safety, limits & history
`manage_activity_limits` · `set_daily_dm_limit` · `list_actions`

Check budgets before acting, adjust caps, and read the audit trail — what the agent already did, what's staged for approval, why something was refused, and the current safety mode.

Full per-tool reference (parameters, access, tiers): **[apex.new/tools.md](https://www.apex.new/tools.md)**

## The safety model (this is the point)

Every write the agent makes shares the **same daily/weekly budgets** as the account's automations (DMs, replies, connections), honors the **do-not-engage list**, and is **paced and rate-limit-aware**. Actions can be refused or queued for the user's approval — and the agent is told why. Limits are calibrated from LeadShark's production LinkedIn volume, not guesswork. Agents are expected to check `list_actions` before acting and to work within limits rather than around them.

## What this repo's server does

This discovery stub speaks MCP over **Streamable HTTP** (JSON-RPC 2.0 over POST, JSON responses, stateless, no SSE) and exposes three no-auth informational tools:

| Tool | What it returns |
| --- | --- |
| `about_apex` | What Apex is, tier pricing, trial paths, key links |
| `get_setup_steps` | The 5-step connect flow (account → LinkedIn → 24h unlock → mount MCP → first play) |
| `first_plays` | Copy-paste starter prompts: verify, discover, enrich, act |

It has **no LinkedIn powers of its own** — it's the handshake and the briefing, not the hands.

## Try it

Add `https://www.apex.new/mcp` as a custom connector / MCP server in your AI app, or run this repo locally:

```bash
node server.mjs          # Node 18+, zero dependencies, listens on PORT (default 3000)
```

Handshake by hand:

```bash
curl -s -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

## Get the full loadout

1. Create a [LeadShark account](https://apex.leadshark.io/auth/register) — free 7-day trial, no card.
2. Connect the LinkedIn account the agent will operate.
3. Unlock the one-time **24-hour Apex operator window** (Settings → Apex Settings).
4. Add `https://apex.leadshark.io/mcp` to your AI app and authorize with LeadShark.
5. Ask: *"Check if you can see LeadShark Apex and list the tools available."*

Apex is **$119/mo** after the trial. LeadShark Pro ($39/mo) automates your lead magnet; Pro+ ($59/mo) scales automations and gated funnels; Apex is the operator loadout on top.

- Website: [apex.new](https://www.apex.new) · Pricing: [apex.new/pricing](https://www.apex.new/pricing)
- MCP setup guide: [apex.leadshark.io/docs/mcp](https://apex.leadshark.io/docs/mcp)
- Agent operating guide: [apex.new/agents.md](https://www.apex.new/agents.md)
- Machine-readable index: [apex.new/llms.txt](https://www.apex.new/llms.txt)

## License

MIT
