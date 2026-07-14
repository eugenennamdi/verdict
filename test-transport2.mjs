import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
  name: "Verdict-A2MCP",
  version: "1.0.0",
}, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => { return { tools: [] }; });
server.setRequestHandler(CallToolRequestSchema, async () => { return { content: [] }; });

const transport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
  enableJsonResponse: true, 
});
server.connect(transport);

const req = new Request("http://localhost/api/evaluate-mcp", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream" },
  body: JSON.stringify({"target_url": "https://okx.com", "audit_type": "growth"}),
  duplex: "half"
});

async function main() {
  const res = await transport.handleRequest(req);
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
main().catch(console.error);
