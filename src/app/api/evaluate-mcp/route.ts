import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { extractContext, generateAudit } from "@/lib/engine";
import { withX402 } from "@okxweb3/app-x402-next";
import { getPaymentServer } from "@/lib/payment";

// Define the MCP Server
const server = new Server({
  name: "Verdict-A2MCP",
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

const handleRequest = async (req: Request) => {
  try {
    return await transport.handleRequest(req);
  } catch (error) {
    console.error("MCP Transport Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

const routeConfig = {
  accepts: [
    {
      scheme: "exact" as const,
      network: "eip155:196" as const,
      asset: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", // USDT on X Layer
      price: "0.5", // 0.5 USDT
      payTo: process.env.PAYMENT_ADDRESS || "0x8713783e9d8391c4bf54f705b355ba775184f906", // Hardcoded to User's Wallet
    }
  ],
  description: "Verdict MCP Evaluation Server",
  resource: "Verdict-A2MCP",
};

// Next.js API Routes (App Router) wrapped with x402 Payment verification
export const POST = async (req: Request) => {
  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return protectedHandler(req as any);
};

export const GET = async (req: Request) => {
  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return protectedHandler(req as any);
};

