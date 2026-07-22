import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { performFullAudit, ScrapingError } from "@/lib/engine";
import { withX402 } from "@okxweb3/app-x402-next";
import { getPaymentServer } from "@/lib/payment";
import { supabaseAdmin } from "@/lib/supabase";
import { submitAttestation } from "@/lib/onchain";

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
            url: { type: "string", description: "The exact URL of the startup to evaluate. Do NOT guess this. If the user hasn't provided one, ask them." },
            fallback_text: { type: "string", description: "Optional. If a URL fails to scrape due to bot protection, ask the user to paste the raw HTML or text of the landing page here." },
            txHash: { type: "string", description: "Optional. If this tool previously returned a 402 Payment Required error, you MUST call this tool again and pass the resulting payment transaction hash here." }
          },
          required: ["url"]
        }
      }]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "evaluate_startup") {
      const { url, fallback_text } = request.params.arguments as { url?: string, fallback_text?: string };
      if (!url || typeof url !== 'string') {
        throw new Error("URL is required");
      }

      try {
        console.log(`Evaluating URL: ${url}`);
        
        // Single optimized LLM call to fit within Vercel's 60s limit for Hobby plans
        const audit = await performFullAudit(url, fallback_text);
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
            
            try {
              const statusStr = audit.overallScore >= 70 ? 'Pass' : 'Review Needed';
              const hash = await submitAttestation(data.id, url, audit.overallScore, statusStr);
              await supabaseAdmin.from('reports').update({ attestation_hash: hash }).eq('id', data.id);
            } catch (onchainError) {
              console.error('Onchain Attestation Error in MCP:', onchainError);
            }
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
      let reqId: string | number = 1;
      try {
        const body = await clonedReq.json();
        reqId = body?.id || 1;
        
        // Mock initialization for stateless clients to avoid SSE negotiation errors
        if (body.method === "initialize") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id || 1,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {},
              serverInfo: {
                name: "verdict-mcp",
                version: "1.0.0"
              }
            }
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        
        if (body.method === "notifications/initialized") {
          return new Response("", { status: 202 });
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
                    url: { type: "string", description: "The exact URL of the startup to evaluate. Do NOT guess this. If the user hasn't provided one, ask them." },
                    fallback_text: { type: "string", description: "Optional. If a URL fails to scrape due to bot protection, ask the user to paste the raw HTML or text of the landing page here." }
                  },
                  required: ["url"]
                }
              }]
            }
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        // For stateless A2MCP agents (like Hermes), just extract the URL and run the audit directly
        const hasUrl = body.target_url || body.url || body.params?.url || body.arguments?.url || body.params?.arguments?.url || body.params?.arguments?.target_url;
        const fallbackText = body.fallback_text || body.params?.fallback_text || body.arguments?.fallback_text || body.params?.arguments?.fallback_text;
        
        if (hasUrl) {
          console.log(`Bypassing MCP SDK initialization to evaluate URL directly: ${hasUrl}`);
          const audit = await performFullAudit(hasUrl, fallbackText);
          
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
              
              try {
                const statusStr = audit.overallScore >= 70 ? 'Pass' : 'Review Needed';
                const hash = await submitAttestation(data.id, hasUrl, audit.overallScore, statusStr);
                await supabaseAdmin.from('reports').update({ attestation_hash: hash }).eq('id', data.id);
              } catch (onchainError) {
                console.error('Onchain Attestation Error in MCP:', onchainError);
              }
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

          let txHash = req.headers.get("x-payment-tx-hash");
          
          if (!txHash) {
            // If it bypassed the interceptor and used the standard OKX withX402 SDK,
            // we can decode the PAYMENT-SIGNATURE to find the transaction receipt.
            const sigHeader = req.headers.get("payment-signature") || req.headers.get("PAYMENT-SIGNATURE") || req.headers.get("authorization");
            if (sigHeader) {
               try {
                 let token = sigHeader;
                 const match = sigHeader.trim().match(/^(Bearer|L402|L402-MAC)\s+(.+)$/i);
                 if (match) token = match[2].trim();
                 const decoded = Buffer.from(token, "base64").toString("utf-8");
                 const sigObj = JSON.parse(decoded);
                 if (sigObj.receipt) {
                   txHash = sigObj.receipt;
                 } else if (sigObj.payment_tx) {
                   txHash = sigObj.payment_tx;
                 }
               } catch (e) {
                 // Ignore
               }
            }
          }

          if (txHash && txHash.startsWith("0x")) {
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
        if (body.method === "tools/call" || body.method === "evaluate" || body.method === "audit" || body.method === "evaluate_startup" || body.action === "evaluate") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id || 1,
            error: {
              code: -32602,
              message: "Invalid params: 'url' is required. Please ask the user for the URL and resubmit."
            }
          }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
      } catch (err: any) {
        console.error("Direct evaluation error:", err);
        const isScrapingError = err.name === 'ScrapingError';

        const usedHash = req.headers.get("x-payment-tx-hash");
        if (usedHash) {
          console.log(`[Hybrid Interceptor] Releasing transaction lock for ${usedHash} due to evaluation error: ${err.message}`);
          await supabaseAdmin.from('used_transactions').delete().eq('tx_hash', usedHash);
        }

        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: reqId,
          result: {
            content: [
              {
                type: "text",
                text: isScrapingError 
                  ? `SYSTEM ALERT: ${err.message}. Please ask the user to provide the raw text or HTML of the startup's website and pass it into the \`fallback_text\` parameter.`
                  : `SYSTEM ALERT: Evaluation failed due to an internal error: ${err.message}.`
              }
            ],
            isError: true
          }
        }), { status: 200, headers: { "Content-Type": "application/json" } });
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

  let rawBodyText: string | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      rawBodyText = await req.text();
    } catch {
      // Ignore
    }
  }

  // Aggressively extract payment_tx or txHash from anywhere in the body
  let paymentTx: string | null = null;
  if (rawBodyText) {
    try {
      const body = JSON.parse(rawBodyText);
      paymentTx = body?.txHash || body?.payment_tx || 
                  body?.params?.txHash || body?.params?.payment_tx || 
                  body?.arguments?.txHash || body?.arguments?.payment_tx || 
                  body?.params?.arguments?.txHash || body?.params?.arguments?.payment_tx || null;
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
    
    newHeaders.set(headerName, token);
  };

  processHeader(rawSig, "payment-signature");
  processHeader(rawAuth, "authorization");
  
  const finalAuthToken = newHeaders.get("authorization");
  if (finalAuthToken && !newHeaders.get("payment-signature")) {
    newHeaders.set("payment-signature", finalAuthToken);
  }

  // Create a completely fresh Request object with the buffered body
  // This guarantees that the stream is never accidentally drained by middleware
  return new Request(routeConfig.resource, {
    method: req.method,
    headers: newHeaders,
    body: rawBodyText
  } as RequestInit);
};

export const POST = async (req: Request) => {
  const cleanReq = await createCleanReq(req);
  console.log("POST request initiated. ALL HEADERS:", Object.fromEntries(req.headers.entries()));
  console.log("Raw PAYMENT-SIGNATURE from Hermes:", req.headers.get("payment-signature"));
  console.log("Cleaned PAYMENT-SIGNATURE:", cleanReq.headers.get("payment-signature"));
  
  let requiresPayment = true;
  let interceptedTxHash: string | null = null;
  let reqId: string | number = 1;
  try {
    const cloned = cleanReq.clone();
    const body = await cloned.json();
    reqId = body?.id || 1;
    if (body.method === "tools/list" || body.method === "initialize" || body.method === "notifications/initialized") {
      requiresPayment = false;
    }
    interceptedTxHash = body?.txHash || body?.payment_tx || 
                        body?.params?.txHash || body?.params?.payment_tx || 
                        body?.arguments?.txHash || body?.arguments?.payment_tx || 
                        body?.params?.arguments?.txHash || body?.params?.arguments?.payment_tx || null;
  } catch {
    // Ignore
  }

  // If there's a payment signature, we used to wait 5 seconds. We removed it because
  // OpenClaw and other clients have a 60s timeout, and the LLM + scraper can take up to 55s.
  // The hybrid interceptor will gracefully return a SYSTEM ALERT if it's not indexed yet.
  if (requiresPayment && cleanReq.headers.get("payment-signature")) {
    console.log("Payment signature detected. Skipping manual wait to avoid client timeout...");
  }

  if (!requiresPayment) {
    return handleRequest(cleanReq);
  }

  // Hand off to the official OKX SDK for robust payment verification

  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalRes = await withBodyIf402(cleanReq, protectedHandler as any);

  // If the LLM threw a ScrapingError, we returned 418 to explicitly prevent withX402 from settling the payment.
  // Now we rewrite it back to 200 so the agent receives the graceful error and can ask for fallback text.
  if (finalRes.status === 418) {
    return new Response(finalRes.body, {
      status: 200,
      headers: finalRes.headers
    });
  }

  return finalRes;
};

export const GET = async (req: Request) => {
  const cleanReq = await createCleanReq(req);
  console.log("GET request initiated. ALL HEADERS:", Object.fromEntries(req.headers.entries()));
  
  // Intercept OKX.AI platform verification pings
  // The MCP WebStandardStreamableHTTPServerTransport throws a 406 Not Acceptable 
  // if a GET request does not explicitly contain Accept: text/event-stream.
  // We need to return 200 OK for standard health checks from the platform.
  const acceptHeader = cleanReq.headers.get("accept") || "";
  if (!acceptHeader.includes("text/event-stream")) {
    console.log("Bypassing MCP SSE initialization for non-SSE GET request. Returning 200 OK.");
    return new Response(JSON.stringify({ 
      status: "online", 
      message: "Verdict A2MCP Endpoint is active.",
      x402: routeConfig 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // GET is only used for SSE initialization in MCP, should be free
  return handleRequest(cleanReq);
};

