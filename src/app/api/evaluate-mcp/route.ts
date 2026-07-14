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
        description: "Evaluates a startup landing page across 7 growth pillars. Deducts a payment. You MUST explicitly ask the user for the startup's URL before calling this tool. NEVER guess or use the service URL.",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "The exact URL of the startup to evaluate. Do NOT guess this. If the user hasn't provided one, ask them." }
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
                fdi_buzzword_density: 0,
                fdi_trust_deficit: 0,
                fdi_gatekeeping_friction: 0,
                fdi_feature_ratio: 0,
                fdi_overall_score: audit.overallScore || 0,
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
        
        // Check if this is an initialization request for stateful MCP clients
        if (body.method === "initialize" || body.method === "notifications/initialized") {
          return await transport.handleRequest(req);
        }

        // Handle stateless tools/list request
        if (body.method === "tools/list") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id || 1,
            result: {
              tools: [{
                name: "evaluate_startup",
                description: "Evaluates a startup landing page across 7 growth pillars. Deducts a payment. You MUST explicitly ask the user for the startup's URL before calling this tool. NEVER guess or use the service URL.",
                inputSchema: {
                  type: "object",
                  properties: {
                    url: { type: "string", description: "The exact URL of the startup to evaluate. Do NOT guess this. If the user hasn't provided one, ask them." }
                  },
                  required: ["url"]
                }
              }]
            }
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        // For stateless A2MCP agents (like Hermes), just extract the URL and run the audit directly
        const hasUrl = body.target_url || body.url || body.params?.url || body.arguments?.url || body.params?.arguments?.url;
        
        if (hasUrl) {
          console.log(`Bypassing MCP SDK initialization to evaluate URL directly: ${hasUrl}`);
          const audit = await performFullAudit(hasUrl);
          
          if (!audit) {
            throw new Error("Failed to generate audit");
          }

          let reportUrl = null;
          try {
            const { data, error } = await supabaseAdmin
              .from('reports')
              .insert([{
                url: hasUrl,
                company_name: audit.company_name || "Unknown",
                fdi_buzzword_density: 0,
                fdi_trust_deficit: 0,
                fdi_gatekeeping_friction: 0,
                fdi_feature_ratio: 0,
                fdi_overall_score: audit.overallScore || 0,
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
              }])
              .select('id')
              .single();
            if (!error && data?.id) {
              reportUrl = `https://tryverdict.xyz/report/${data.id}`;
            }
          } catch (err) {
            console.error("Failed to save report to supabase in MCP", err);
          }

          const parsedContent: Record<string, unknown> = {
            company_name: audit.company_name,
            target_audience: audit.target_audience,
            growth_readiness_score: audit.overallScore,
            score_interpretation: audit.score_interpretation,
            verdict: audit.the_verdict,
            actionable_feedback: audit.priority_matrix,
            ...(reportUrl ? { report_url: reportUrl } : {})
          };

          const txHash = req.headers.get("x-payment-tx-hash");
          if (txHash) {
            parsedContent.transaction_link = `https://web3.okx.com/explorer/x-layer/evm/tx/${txHash}`;
          }

          const mcpResponse = {
            jsonrpc: "2.0",
            id: body.id || 1,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(parsedContent, null, 2)
                }
              ]
            }
          };

          return new Response(JSON.stringify(mcpResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        // If Hermes tries to call an evaluation method but forgot the URL parameter
        if (body.method === "tools/call" || body.method === "evaluate" || body.method === "audit" || body.method === "evaluate_startup") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id || 1,
            error: {
              code: -32602,
              message: "Invalid params: 'url' is required."
            }
          }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
      } catch (err) {
        console.error("Direct evaluation error:", err);
      }
    }

    return await transport.handleRequest(req);
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

const extractToken = (headerVal: string | null) => {
  if (!headerVal) return { prefix: '', token: '' };
  const trimmed = headerVal.trim();
  const match = trimmed.match(/^(Bearer|L402|L402-MAC)\s+(.+)$/i);
  if (match) {
    return { prefix: match[1] + ' ', token: match[2].replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/') };
  }
  return { prefix: '', token: trimmed.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/') };
};

const createCleanReq = async (req: Request) => {
  const newHeaders = new Headers(req.headers);
  const rawSig = newHeaders.get("payment-signature") || newHeaders.get("PAYMENT-SIGNATURE");
  const rawAuth = newHeaders.get("authorization") || newHeaders.get("Authorization");
  
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

  const processHeader = (rawVal: string | null, headerName: string) => {
    if (!rawVal) return;
    let { prefix, token } = extractToken(rawVal);
    
    if (paymentTx) {
      try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const sigObj = JSON.parse(decoded);
        if (!sigObj.receipt) {
          sigObj.receipt = paymentTx;
          token = Buffer.from(JSON.stringify(sigObj)).toString("base64");
        }
      } catch {
        // Ignore parsing errors
      }
    }
    
    // The OKX SDK strictly expects the raw base64 string in the header without any prefixes
    // because it runs JSON.parse(safeBase64Decode(header)). 
    // If we include 'L402 ', it will crash.
    newHeaders.set(headerName, token);
  };

  processHeader(rawSig, "payment-signature");
  processHeader(rawAuth, "authorization");
  
  // Ensure that OKX Next.js SDK can find the payment signature.
  const finalAuthToken = newHeaders.get("authorization");
  if (finalAuthToken && !newHeaders.get("payment-signature")) {
    newHeaders.set("payment-signature", finalAuthToken);
  }

  // Return a proxy that overrides the headers and url properties
  return new Proxy(req, {
    get(target, prop) {
      if (prop === 'headers') return newHeaders;
      // Vercel sometimes forwards internal URLs (e.g. localhost) which causes signature verification to fail 
      // because the signature was signed exactly for the public resource URL.
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      if (prop === 'url') return routeConfig.resource;
      
      const value = (target as unknown as Record<string, unknown>)[prop as string];
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    }
  });
};

// --- HYBRID INTERCEPTOR HELPER ---
const verifyTransactionManually = async (txHash: string): Promise<boolean> => {
  try {
    console.log(`[Hybrid Interceptor] Verifying raw tx hash against X Layer RPC: ${txHash}`);
    const res = await fetch("https://rpc.xlayer.tech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 1
      })
    });
    const data = await res.json();
    
    // Check if receipt exists and status is 1 (success)
    if (data && data.result && data.result.status === "0x1") {
      console.log(`[Hybrid Interceptor] Transaction ${txHash} successfully verified on-chain.`);
      return true;
    }
    
    console.log(`[Hybrid Interceptor] Transaction ${txHash} not yet confirmed or failed.`);
    return false;
  } catch (error) {
    console.error("[Hybrid Interceptor] RPC verification error:", error);
    return false;
  }
};
// --- END HYBRID INTERCEPTOR HELPER ---

export const POST = async (req: Request) => {
  const cleanReq = await createCleanReq(req);
  console.log("POST request initiated. ALL HEADERS:", Object.fromEntries(req.headers.entries()));
  console.log("Raw PAYMENT-SIGNATURE from Hermes:", req.headers.get("payment-signature"));
  console.log("Cleaned PAYMENT-SIGNATURE:", cleanReq.headers.get("payment-signature"));
  
  let requiresPayment = true;
  try {
    const cloned = cleanReq.clone();
    const body = await cloned.json();
    if (body.method === "tools/list" || body.method === "initialize" || body.method === "notifications/initialized") {
      requiresPayment = false;
    }
  } catch {
    // Ignore
  }

  // If there's a payment signature, add a 5 second delay to allow X Layer to confirm and index the transaction
  if (requiresPayment && cleanReq.headers.get("payment-signature")) {
    console.log("Payment signature detected. Waiting 5 seconds for X Layer RPC confirmation...");
    await new Promise(r => setTimeout(r, 5000));
  }

  if (!requiresPayment) {
    return handleRequest(cleanReq);
  }

  // --- HYBRID INTERCEPTOR ---
  // If the payment signature is just a raw transaction hash (length 66, starts with 0x),
  // this is a generic AI agent (like Hermes) that doesn't natively support building x402 EIP-712 payloads.
  // We manually verify it against the X Layer RPC to gracefully allow them to use the service.
  const rawTxHash = (cleanReq.headers.get("payment-signature") || "").trim();
  if (rawTxHash.startsWith("0x") && rawTxHash.length === 66) {
    const isValid = await verifyTransactionManually(rawTxHash);
    if (isValid) {
      console.log("[Hybrid Interceptor] Bypassing withX402 SDK due to valid raw transaction hash.");
      
      // Inject the transaction hash into a header so the downstream code knows it's paid
      const proxyReq = new Proxy(cleanReq, {
        get(target, prop) {
          if (prop === 'headers') {
            const h = new Headers(cleanReq.headers);
            h.set("x-payment-tx-hash", rawTxHash);
            return h;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (target as any)[prop as string];
          if (typeof value === 'function') return value.bind(target);
          return value;
        }
      });
      return handleRequest(proxyReq);
    }
  }
  // --- END HYBRID INTERCEPTOR ---

  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return withBodyIf402(cleanReq, protectedHandler as any);
};

export const GET = async (req: Request) => {
  const cleanReq = await createCleanReq(req);
  console.log("GET request initiated. ALL HEADERS:", Object.fromEntries(req.headers.entries()));
  
  // GET is only used for SSE initialization in MCP, should be free
  return handleRequest(cleanReq);
};

