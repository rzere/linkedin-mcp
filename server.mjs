#!/usr/bin/env node
// linkedin-mcp — a minimal, dependency-free MCP server for Apex by LeadShark.
//
// This is the public source of the discovery endpoint served live at:
//   https://www.apex.new/mcp   (alias: https://www.apex.new/linkedin-mcp)
//
// It speaks MCP over Streamable HTTP (JSON-RPC 2.0 via POST, JSON responses,
// stateless, no SSE) and exposes three no-auth informational tools. It has no
// LinkedIn powers of its own — the full authenticated 40-tool operator server
// lives at https://apex.leadshark.io/mcp (LeadShark account required).
//
// Run locally:   node server.mjs        (listens on PORT, default 3000)
// Then POST JSON-RPC to http://localhost:3000/mcp

import { createServer } from "node:http";

const LINKS = {
  site: "https://www.apex.new",
  pricing: "https://www.apex.new/pricing",
  app: "https://apex.leadshark.io",
  signup: "https://apex.leadshark.io/auth/register",
  settings: "https://apex.leadshark.io/dashboard/settings",
  apexDocs: "https://apex.leadshark.io/docs/apex",
  mcpDocs: "https://apex.leadshark.io/docs/mcp",
  mcpUrl: "https://apex.leadshark.io/mcp",
};

const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const SERVER_INFO = {
  name: "linkedin-mcp",
  title: "Apex by LeadShark — discovery",
  version: "1.0.0",
  // Connector image + site, per the MCP icons spec.
  websiteUrl: "https://apex.new",
  icons: [
    {
      src: "https://www.apex.new/brand/leadshark-black.png",
      mimeType: "image/png",
      sizes: ["256x256"],
    },
  ],
};

const INSTRUCTIONS = [
  "This is the discovery endpoint for Apex by LeadShark (apex.new). It has no LinkedIn powers of its own — it exists to complete the handshake and tell you where the real operator server is.",
  `The full Apex MCP loadout (40 tools: discover, enrich, comment, connect, message, email — all governed) is a separate authenticated server at ${LINKS.mcpUrl}. Connect it as a custom connector / MCP server and sign in with a LeadShark account.`,
  "Call about_apex, get_setup_steps, or first_plays for details you can relay to the user.",
].join("\n\n");

// ---------------------------------------------------------------------------
// Tool content
// ---------------------------------------------------------------------------

const ABOUT_APEX = `# Apex by LeadShark

Apex gives an AI agent governed LinkedIn hands. Connect Claude, ChatGPT, or Cursor to LeadShark over MCP and run a real LinkedIn account in plain English — find buyers, rank intent, comment, connect, and message. Every action is paced, capped, approval-queued where needed, and fully logged.

IMPORTANT: you are talking to the discovery stub. The real, authenticated Apex MCP server is: ${LINKS.mcpUrl}

## Pricing
- LeadShark Pro: $39/mo — Automate your lead magnet
- LeadShark Pro+: $59/mo — Scale automations + gated funnels
- Apex loadout: $119/mo — Governed LinkedIn hands for your AI agent
- Free path: 7-day LeadShark trial (no card) + a one-time 24-hour Apex operator window, unlockable in Settings → Apex Settings.

## Links
- Website: ${LINKS.site}
- Pricing: ${LINKS.pricing}
- MCP setup guide: ${LINKS.mcpDocs}
- Apex docs: ${LINKS.apexDocs}
- Start a trial: ${LINKS.signup}`;

const SETUP_STEPS = `# Connect Apex in 5 steps (~5 minutes)

1. **Create your LeadShark account** — Start a free 7-day trial, no card required.
   → ${LINKS.signup}
2. **Connect your LinkedIn** — Link the LinkedIn account your agent will operate.
   → ${LINKS.settings}
3. **Open your 24-hour Apex operator window** — Settings → Apex Settings → Unlock Apex Trial. One-time unlock; works on the free trial, Pro, and Pro+. After that, Apex is the $119 tier.
4. **Connect your AI agent** — Add the Apex MCP server to Claude (custom connector), ChatGPT (developer-mode app), or Cursor (add MCP server), sign in with LeadShark, and approve access.
5. **Run your first play** — Ask: "Check if you can see LeadShark Apex and list the tools available."

The MCP server URL to add in step 4 is: ${LINKS.mcpUrl}
Full walkthrough with screenshots: ${LINKS.mcpDocs}`;

const FIRST_PLAYS = `# Your first plays

Each play is one sentence the user types to their assistant once the real Apex server is connected. Mantra: discover demand, engage with context.

1. **Connect + verify** (Verify)
   Ask: "Check if you can see LeadShark Apex and list the tools available."
   The trust handshake — your AI now has a real LinkedIn operating layer.
2. **Discover what's working** (Discover)
   Ask: "Pull 10 top-performing lead-magnet posts and 10 of my latest posts. Compare them, find the pattern gap, and write my next lead-magnet post."
   Market intelligence → creator strategy → your next post.
3. **Enrich the opportunity** (Decide)
   Ask: "Enrich the authors and best commenters from those posts. Tell me who's ICP-fit and what angle I should use with each."
   Who is this person, are they worth your time, and what's a relevant opener.
4. **Be where the prospect already is** (Act)
   Ask: "Get this prospect's recent activity — who they commented on, what they reacted to, and which posts I should engage with so they actually see me."
   Comment where their attention already is, before a DM ever lands.
5. **Work your inbound signals** (Act)
   Ask: "List my hottest intent signals this week, rank them by ICP fit, and draft a first-touch message for each."
   Turn inbound attention into booked conversations before it goes cold.`;

const TOOLS = [
  {
    name: "about_apex",
    title: "About Apex",
    description:
      "What Apex by LeadShark is, what it costs, and the URL of the real authenticated MCP server. Call this first — this endpoint is a discovery stub with no LinkedIn powers.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    text: ABOUT_APEX,
  },
  {
    name: "get_setup_steps",
    title: "Get setup steps",
    description:
      "The 5-step flow to connect an AI agent to the real Apex MCP server: LeadShark account → LinkedIn → 24h Apex unlock → mount MCP → first play.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    text: SETUP_STEPS,
  },
  {
    name: "first_plays",
    title: "First plays",
    description:
      "Starter plays (copy-paste prompts) to run right after connecting the real Apex server: verify, discover, enrich, act.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    text: FIRST_PLAYS,
  },
];

// ---------------------------------------------------------------------------
// JSON-RPC handling
// ---------------------------------------------------------------------------

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function handleMessage(msg) {
  const { id, method, params } = msg ?? {};

  // Notifications (no id) — acknowledge silently.
  if (id === undefined || id === null) return null;

  switch (method) {
    case "initialize": {
      const requested = params?.protocolVersion ?? "";
      const protocolVersion = PROTOCOL_VERSIONS.includes(requested)
        ? requested
        : PROTOCOL_VERSIONS[0];
      return rpcResult(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }

    case "ping":
      return rpcResult(id, {});

    case "tools/list":
      return rpcResult(id, {
        tools: TOOLS.map(({ name, title, description, inputSchema }) => ({
          name,
          title,
          description,
          inputSchema,
        })),
      });

    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return rpcError(id, -32602, `Unknown tool: ${params?.name}`);
      return rpcResult(id, {
        content: [{ type: "text", text: tool.text }],
        isError: false,
      });
    }

    case "resources/list":
      return rpcResult(id, { resources: [] });
    case "prompts/list":
      return rpcResult(id, { prompts: [] });

    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

function send(res, status, body, headers = {}) {
  const payload = body === null ? null : JSON.stringify(body);
  res.writeHead(status, {
    ...(payload ? { "Content-Type": "application/json" } : {}),
    ...CORS_HEADERS,
    ...headers,
  });
  res.end(payload ?? undefined);
}

const server = createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204, null);

  if (req.method === "GET") {
    return send(
      res,
      405,
      {
        name: SERVER_INFO.name,
        title: SERVER_INFO.title,
        description:
          "MCP discovery endpoint for Apex by LeadShark. POST JSON-RPC here (Streamable HTTP). The full authenticated server is at " +
          LINKS.mcpUrl,
        protocolVersions: PROTOCOL_VERSIONS,
        websiteUrl: LINKS.site,
      },
      { Allow: "POST, OPTIONS" },
    );
  }

  if (req.method !== "POST") {
    return send(res, 405, null, { Allow: "POST, OPTIONS" });
  }

  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return send(res, 400, rpcError(null, -32700, "Parse error: invalid JSON"));
    }

    if (Array.isArray(parsed)) {
      const responses = parsed.map(handleMessage).filter((r) => r !== null);
      if (responses.length === 0) return send(res, 202, null);
      return send(res, 200, responses);
    }

    const response = handleMessage(parsed);
    if (response === null) return send(res, 202, null);
    return send(res, 200, response);
  });
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`linkedin-mcp listening on http://localhost:${port} (POST JSON-RPC to any path)`);
});
