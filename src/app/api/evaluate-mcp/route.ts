import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { performFullAudit } from "@/lib/engine";
import { withX402 } from "@okxweb3/app-x402-next";
import { getPaymentServer } from "@/lib/payment";
import { supabaseAdmin } from "@/lib/supabase";

export const maxDuration = 300; // Max allowed for Vercel Hobby to prevent timeouts
export const dynamic = 'force-dynamic'; // Prevent Next.js from caching the 402 response

// Define the MCP Server
const createMCPServer = () => {
  const server = new Server({
    name: "Verdict Evaluation Server",
    version: "1.0.0"
  }, {
    capabilities: { tools: {} }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [{
        name: "evaluate_startup",
        description: "Evaluates a startup landing page across 7 growth pillars. Deducts a payment.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The URL of the startup to evaluate" }
          },
          required: ["url"]
        }
      }]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "evaluate_startup") {
      const { url } = request.params.arguments as { url?: string };
      if (!url || typeof url !== 'string') {
        throw new Error("URL is required");
      }

      try {
        console.log(`Evaluating URL: ${url}`);
        
        // Single optimized LLM call to fit within Vercel's 60s limit for Hobby plans
        const audit = await performFullAudit(url);
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
                company_name: audit.company_name || "Unknown",
                target_audience: audit.target_audience || "Unknown",
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
                company_name: audit.company_name,
                target_audience: audit.target_audience,
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
        
        // Check if Hermes is sending a non-standard MCP request (e.g., method: "evaluate" or missing method)
        const isStandardMcp = body.jsonrpc === "2.0" && body.method === "tools/call" && body.params?.name === "evaluate_startup";
        const hasUrl = body.target_url || body.url || body.params?.url || body.arguments?.url || body.params?.arguments?.url;
        
        if (!isStandardMcp && hasUrl) {
          const fakeReq = new Request(req.url, {
            method: "POST",
            headers: req.headers,
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "tools/call",
              params: {
                name: "evaluate_startup",
                arguments: { url: hasUrl }
              },
              id: body.id || 1
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
              } catch {
                return new Response(contentText, {
                  status: 200,
                  headers: { "Content-Type": "application/json" }
                });
              }
            }
          } catch {
            // Ignore parse errors
          }
          
          return new Response(resText, {
            status: res.status,
            headers: res.headers
          });
        }
      } catch {
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
      } catch {
        // Ignore parse errors, return original response
      }
    }
    return res;
  } catch (error) {
    console.error("MCP Transport Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      } catch {
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

const createCleanReq = async (req: Request) => {
  const newHeaders = new Headers(req.headers);
  let sig = newHeaders.get("payment-signature") || newHeaders.get("PAYMENT-SIGNATURE");
  
  // Intercept payment_tx from body if present
  let paymentTx: string | null = null;
  if (req.method === "POST" && req.body) {
    try {
      const cloned = req.clone();
      const body = await cloned.json();
      if (body && body.payment_tx) {
        paymentTx = body.payment_tx;
      }
    } catch {
      // Ignore
    }
  }

  if (sig) {
    sig = cleanSignature(sig)!;
    if (paymentTx) {
      try {
        const decoded = Buffer.from(sig, "base64").toString("utf-8");
        const sigObj = JSON.parse(decoded);
        if (!sigObj.receipt) {
          sigObj.receipt = paymentTx;
          sig = Buffer.from(JSON.stringify(sigObj)).toString("base64");
        }
      } catch {
        // Ignore parsing errors
      }
    }
    newHeaders.set("payment-signature", sig);
  }
  
  const authSig = newHeaders.get("authorization") || newHeaders.get("Authorization");
  if (authSig) {
    newHeaders.set("authorization", cleanSignature(authSig)!);
  }
  
  // Return a proxy that overrides the headers property
  return new Proxy(req, {
    get(target, prop) {
      if (prop === 'headers') return newHeaders;
      const value = (target as unknown as Record<string, unknown>)[prop as string];
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    }
  });
};

export const POST = async (req: Request) => {
  const cleanReq = await createCleanReq(req);
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
  const cleanReq = await createCleanReq(req);
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

