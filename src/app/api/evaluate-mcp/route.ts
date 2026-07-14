import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { extractContext, generateAudit } from "@/lib/engine";
import { withX402 } from "@okxweb3/app-x402-next";
import { getPaymentServer } from "@/lib/payment";
import { supabaseAdmin } from "@/lib/supabase";

export const maxDuration = 300; // Max allowed for Vercel Hobby to prevent timeouts
export const dynamic = 'force-dynamic'; // Prevent Next.js from caching the 402 response

// Define the MCP Server
const createMCPServer = () => {
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
        const extracted = await extractContext(url);
        if (!extracted) {
          throw new Error("Failed to extract context from URL");
        }

        const audit = await generateAudit(url, extracted);
        if (!audit) {
          throw new Error("Failed to generate audit");
        }

        // Save to Supabase
        let reportUrl = null;
        try {
          const { data, error } = await supabaseAdmin
            .from('reports')
            .insert([
              {
                url: url,
                company_name: extracted.company_name || "Unknown",
                target_audience: extracted.target_audience || "Unknown",
                growth_readiness_score: audit.overallScore || 0,
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

  return server;
};

const handleRequest = async (req: Request) => {
  try {
    const server = createMCPServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
      enableJsonResponse: true, // Allow direct JSON-RPC responses for simple request/response
    });
    await server.connect(transport);

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
              const contentText = mcpResult.result.content[0].text;
              try {
                const parsedContent = JSON.parse(contentText);
                const txHash = req.headers.get("x-payment-tx-hash");
                if (txHash) {
                  parsedContent.transaction_link = `https://web3.okx.com/explorer/x-layer/evm/tx/${txHash}`;
                }
                return new Response(JSON.stringify(parsedContent, null, 2), {
                  status: 200,
                  headers: { "Content-Type": "application/json" }
                });
              } catch (parseError) {
                return new Response(contentText, {
                  status: 200,
                  headers: { "Content-Type": "application/json" }
                });
              }
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

    const res = await transport.handleRequest(req);
    const txHash = req.headers.get("x-payment-tx-hash");
    if (txHash && res.headers.get("content-type")?.includes("application/json")) {
      const resClone = res.clone();
      try {
        const json = await resClone.json();
        if (json.result?.content?.[0]?.text) {
          const contentObj = JSON.parse(json.result.content[0].text);
          contentObj.transaction_link = `https://web3.okx.com/explorer/x-layer/evm/tx/${txHash}`;
          json.result.content[0].text = JSON.stringify(contentObj, null, 2);
          return new Response(JSON.stringify(json), { status: res.status, headers: res.headers });
        }
      } catch (e) {
        // Ignore parse errors, return original response
      }
    }
    return res;
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

const cleanSignature = (sig: string | null) => {
  if (!sig) return sig;
  let clean = sig.replace(/^Bearer\s+/i, '');
  clean = clean.trim().replace(/\s+/g, '');
  clean = clean.replace(/-/g, '+').replace(/_/g, '/');
  return clean;
};

const createCleanReq = (req: Request) => {
  const newHeaders = new Headers(req.headers);
  const sig = newHeaders.get("payment-signature") || newHeaders.get("PAYMENT-SIGNATURE");
  if (sig) {
    newHeaders.set("payment-signature", cleanSignature(sig)!);
  }
  
  const authSig = newHeaders.get("authorization") || newHeaders.get("Authorization");
  if (authSig) {
    newHeaders.set("authorization", cleanSignature(authSig)!);
  }
  
  // Return a proxy that overrides the headers property
  return new Proxy(req, {
    get(target, prop) {
      if (prop === 'headers') return newHeaders;
      const value = (target as any)[prop];
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    }
  });
};

export const POST = async (req: Request) => {
  const cleanReq = createCleanReq(req);
  console.log("POST request initiated. ALL HEADERS:", Object.fromEntries(req.headers.entries()));
  console.log("Raw PAYMENT-SIGNATURE from Hermes:", req.headers.get("payment-signature"));
  console.log("Cleaned PAYMENT-SIGNATURE:", cleanReq.headers.get("payment-signature"));
  
  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return withBodyIf402(cleanReq, protectedHandler as any);
};

export const GET = async (req: Request) => {
  const cleanReq = createCleanReq(req);
  console.log("GET request initiated. ALL HEADERS:", Object.fromEntries(req.headers.entries()));
  console.log("Raw PAYMENT-SIGNATURE from Hermes on GET:", req.headers.get("payment-signature"));
  console.log("Cleaned PAYMENT-SIGNATURE on GET:", cleanReq.headers.get("payment-signature"));
  
  // Also decode and log the payload if it exists
  const sig = cleanReq.headers.get("payment-signature");
  if (sig) {
    try {
      const decoded = Buffer.from(sig, "base64").toString("utf-8");
      console.log("Decoded Payload on GET:", decoded);
    } catch (e) {
      console.error("Failed to decode on GET:", e);
    }
  }

  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return withBodyIf402(cleanReq, protectedHandler as any);
};

