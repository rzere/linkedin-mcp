# linkedin-mcp

A minimal, dependency-free **MCP server** for [Apex by LeadShark](https://www.apex.new) — governed LinkedIn hands for AI agents.

This is the public source of the **discovery endpoint** served live at:

- **`https://www.apex.new/mcp`** (alias: `https://www.apex.new/linkedin-mcp`)

Mount it in Claude, ChatGPT, or Cursor and it completes the MCP handshake instantly — no account, no auth — then tells your agent what Apex is and where the real operator server lives.

## What it does

It speaks MCP over **Streamable HTTP** (JSON-RPC 2.0 over POST, JSON responses, stateless, no SSE) and exposes three informational tools:

| Tool | What it returns |
| --- | --- |
| `about_apex` | What Apex is, tier pricing, trial paths, key links |
| `get_setup_steps` | The 5-step connect flow (account → LinkedIn → 24h unlock → mount MCP → first play) |
| `first_plays` | Copy-paste starter prompts: verify, discover, enrich, act |

It has **no LinkedIn powers of its own**. The full authenticated 35-tool operator server — discover, enrich, comment, connect, message, all paced, capped, and logged — is at:

- **`https://apex.leadshark.io/mcp`** (requires a [LeadShark](https://apex.leadshark.io) account)

## Try it

Add `https://www.apex.new/mcp` as a custom connector / MCP server in your AI app, or run it locally:

```bash
node server.mjs          # listens on PORT (default 3000)
```

Handshake by hand:

```bash
curl -s -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

Requires Node 18+. No dependencies.

## The real thing

- Website: [apex.new](https://www.apex.new)
- Pricing: [apex.new/pricing](https://www.apex.new/pricing)
- MCP setup guide: [apex.leadshark.io/docs/mcp](https://apex.leadshark.io/docs/mcp)
- Agent operating guide: [apex.new/agents.md](https://www.apex.new/agents.md)
- Full tool reference: [apex.new/tools.md](https://www.apex.new/tools.md)

## License

MIT
