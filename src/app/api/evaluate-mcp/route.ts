import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { extractContext, generateAudit } from "@/lib/engine";

// Define the MCP Server
const server = new Server({
  name: "VERDICT-A2MCP",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

// Setup the Tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "evaluate_startup",
        description: "Evaluates a startup landing page URL and returns a brutal growth readiness audit.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The URL of the startup landing page (e.g. https://stripe.com)" }
          },
          required: ["url"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "evaluate_startup") {
    const url = String(request.params.arguments?.url);
    if (!url) {
      throw new Error("URL is required");
    }

    try {
      // 1. Extract context
      const extracted = await extractContext(url);
      
      // 2. Generate audit
      const audit = await generateAudit(url, extracted);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              company_name: extracted.company_name,
              target_audience: extracted.target_audience,
              growth_readiness_score: audit.growth_readiness_score,
              founder_delusion_index: audit.founder_delusion_index,
              verdict: audit.verdict,
              actionable_feedback: audit.actionable_feedback
            }, null, 2)
          }
        ]
      };
    } catch (e: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error evaluating startup: ${e instanceof Error ? e.message : String(e)}`
          }
        ],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Use the stateless streamable HTTP transport
const transport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Stateless mode
  enableJsonResponse: true, // Allow direct JSON-RPC responses for simple request/response
});

server.connect(transport);

export async function POST(req: Request) {
  try {
    return await transport.handleRequest(req);
  } catch (error) {
    console.error("MCP Transport Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    return await transport.handleRequest(req);
  } catch (error) {
    console.error("MCP Transport Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
