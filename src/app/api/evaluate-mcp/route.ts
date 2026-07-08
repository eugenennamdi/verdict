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
              growth_readiness_score: audit.overallScore,
              score_interpretation: audit.score_interpretation,
              verdict: audit.the_verdict,
              actionable_feedback: audit.priority_matrix
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
    // OKX Agent Payments Protocol (x402) integration
    const paymentSignature = req.headers.get("payment-signature") || req.headers.get("x-payment");
    
    if (!paymentSignature) {
      const payload = {
        x402Version: "2",
        resource: "VERDICT-A2MCP",
        accepts: [
          {
            scheme: "exact",
            network: "eip155:196", // X Layer
            asset: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", // USDT on X Layer
            amount: "500000", // 0.5 USDT
            payTo: process.env.PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000" // Set your wallet address in .env
          }
        ]
      };
      
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
      
      return new Response("Payment Required", {
        status: 402,
        headers: {
          "PAYMENT-REQUIRED": base64Payload,
          "Access-Control-Expose-Headers": "PAYMENT-REQUIRED"
        }
      });
    }

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
