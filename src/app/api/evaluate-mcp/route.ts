import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { extractContext, generateAudit } from "@/lib/engine";
import { withX402 } from "@okxweb3/app-x402-next";
import { getPaymentServer } from "@/lib/payment";
import { supabaseAdmin } from "@/lib/supabase";

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

      let reportUrl = "";
      try {
        const { data, error } = await supabaseAdmin
          .from('reports')
          .insert([
            {
              company_name: extracted.company_name,
              url,
              fdi_buzzword_density: 0,
              fdi_trust_deficit: 0,
              fdi_gatekeeping_friction: 0,
              fdi_feature_ratio: 0,
              fdi_overall_score: audit.overallScore,
              verdict_value_prop: "N/A",
              verdict_evidence_deficit: "N/A",
              verdict_revenue_viability: "N/A",
              verdict_distribution_moat: "N/A",
              verdict_intent_friction: "N/A",
              verdict_competitive_overlap: "N/A",
              verdict_terminal_risk: "N/A",
              executive_summary: audit.score_interpretation || "N/A",
              first_impression_teardown: "N/A",
              top_5_priorities: audit.priority_matrix || [],
              key_risks: audit.the_verdict || {},
              growth_plan_30_day: audit.pillars || {},
            }
          ])
          .select('id')
          .single();
        if (!error && data?.id) {
          reportUrl = `https://tryverdict.xyz/report/${data.id}`;
        }
      } catch (err) {
        console.error("Failed to save report to supabase in MCP", err);
      }

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
              actionable_feedback: audit.priority_matrix,
              ...(reportUrl ? { report_url: reportUrl } : {})
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
    if (req.method === "POST") {
      const clonedReq = req.clone();
      try {
        const body = await clonedReq.json();
        // If it's a standard JSON request from Hermes testing instead of MCP JSON-RPC
        if (body.target_url && !body.jsonrpc) {
          const fakeReq = new Request(req.url, {
            method: "POST",
            headers: req.headers,
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "tools/call",
              params: {
                name: "evaluate_startup",
                arguments: { url: body.target_url }
              },
              id: 1
            })
          });
          
          const res = await transport.handleRequest(fakeReq);
          const resText = await res.text();
          
          try {
            const mcpResult = JSON.parse(resText);
            if (mcpResult.result?.content?.[0]?.text) {
              return new Response(mcpResult.result.content[0].text, {
                status: 200,
                headers: { "Content-Type": "application/json" }
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
          
          return new Response(resText, {
            status: res.status,
            headers: res.headers
          });
        }
      } catch (e) {
        // Not JSON or empty body, ignore and fall through
      }
    }

    return await transport.handleRequest(req);
  } catch (error) {
    console.error("MCP Transport Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

const routeConfig: any = {
  accepts: [
    {
      scheme: "exact",
      network: "eip155:196",
      price: "0.5",
      payTo: process.env.PAYMENT_ADDRESS || "0x8713783e9d8391c4bf54f705b355ba775184f906", // Hardcoded to User's Wallet
    }
  ],
  description: "Verdict MCP Evaluation Server",
  resource: "https://tryverdict.xyz/api/evaluate-mcp",
};

const withBodyIf402 = async (req: Request, handler: (req: Request) => Promise<Response>) => {
  const res = await handler(req);
  if (res.status === 402) {
    const prHeader = res.headers.get("payment-required");
    if (prHeader) {
      try {
        const decoded = Buffer.from(prHeader, "base64").toString("utf-8");
        const json = JSON.parse(decoded);
        const newRes = new Response(JSON.stringify(json, null, 2), {
          status: 402,
          headers: res.headers,
        });
        newRes.headers.set("content-type", "application/json");
        return newRes;
      } catch (e) {
        // Fallback to original response on parsing error
      }
    }
  }
  return res;
};

// Next.js API Routes (App Router) wrapped with x402 Payment verification
export const POST = async (req: Request) => {
  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return withBodyIf402(req, protectedHandler as any);
};

export const GET = async (req: Request) => {
  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return withBodyIf402(req, protectedHandler as any);
};

