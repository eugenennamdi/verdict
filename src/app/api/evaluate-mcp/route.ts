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
                  ? `SYSTEM ALERT: ${err.message} AGENT ACTION REQUIRED: You MUST immediately stop and ask the user to provide the raw text or HTML of the startup's website. Once they provide it, you must call this tool again and pass their text exactly into the \`fallback_text\` parameter. Do not hallucinate.`
                  : `SYSTEM ALERT: Evaluation failed due to an internal error: ${err.message}. Your payment lock has been released. Please wait 5 seconds and retry the tool with the SAME transaction hash.`
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
  
  // Aggressively extract payment_tx or txHash from anywhere in the body
  let paymentTx: string | null = null;
  if (req.method === "POST" && req.body) {
    try {
      const cloned = req.clone();
      const body = await cloned.json();
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
const verifyTransactionManually = async (txHash: string): Promise<{ valid: boolean; reason?: string }> => {
  try {
    console.log(`[Hybrid Interceptor] Verifying raw tx hash against X Layer RPC: ${txHash}`);
    
    // 1. Check Receipt (did it succeed?) with retries for RPC sync delays
    let receiptData = null;
    let retries = 15;
    while (retries > 0) {
      const receiptRes = await fetch("https://xlayer.drpc.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: [txHash],
          id: 1
        })
      });
      receiptData = await receiptRes.json();
      
      if (receiptData?.result) {
        break; // Found the receipt
      }
      
      console.log(`[Hybrid Interceptor] Receipt not found for ${txHash}. Retrying... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds
      retries--;
    }
    
    if (!receiptData?.result || receiptData.result.status !== "0x1") {
      console.log(`[Hybrid Interceptor] Transaction ${txHash} failed or not found.`);
      return { valid: false, reason: "Transaction failed on-chain or could not be found." };
    }

    // 2. Verify Transfer Event from the Receipt logs
    // ERC20 Transfer event signature: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const USDT_CONTRACT = "0x779ded0c9e1022225f8e0630b35a9b54be713736".toLowerCase();
    const PAYMENT_ADDRESS = (process.env.PAYMENT_ADDRESS || "0x8713783e9d8391c4bf54f705b355ba775184f906").toLowerCase().replace("0x", "");
    const REQUIRED_AMOUNT = BigInt(500000); // 0.5 USDT (6 decimals)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasValidTransfer = receiptData.result.logs.some((log: any) => {
      if (log.address?.toLowerCase() !== USDT_CONTRACT) return false;
      if (log.topics?.[0]?.toLowerCase() !== TRANSFER_TOPIC) return false;
      
      // Topic 2 is the 'to' address
      if (!log.topics?.[2]?.toLowerCase().includes(PAYMENT_ADDRESS)) return false;
      
      const amount = BigInt(log.data);
      return amount >= REQUIRED_AMOUNT;
    });

    if (!hasValidTransfer) {
      console.log(`[Hybrid Interceptor] Transaction does not contain a valid USDT transfer event to us.`);
      return { valid: false, reason: "Transaction is confirmed but does not contain a 0.5 USDT transfer to the correct payment address." };
    }

    // 3. Double-Spend Prevention
    const { error } = await supabaseAdmin
      .from('used_transactions')
      .insert([{ tx_hash: txHash }]);
      
    if (error) {
      if (error.code === '23505' || error.message.includes('duplicate key')) { // Postgres Unique Violation
        console.log(`[Hybrid Interceptor] REPLAY ATTACK BLOCKED. Transaction ${txHash} was already used.`);
        return { valid: false, reason: "This transaction hash has already been used for a previous successful evaluation (Replay Attack)." };
      } else {
        console.error(`[Hybrid Interceptor] Supabase error verifying double-spend:`, error);
        return { valid: false, reason: "Database error while verifying transaction uniqueness." };
      }
    }

    console.log(`[Hybrid Interceptor] Transaction ${txHash} successfully verified on-chain and marked as used.`);
    return { valid: true };
  } catch (error) {
    console.error("[Hybrid Interceptor] RPC verification error:", error);
    return { valid: false, reason: "RPC network error while verifying transaction." };
  }
};
// --- END HYBRID INTERCEPTOR HELPER ---

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

  // --- HYBRID INTERCEPTOR ---
  // If the payment signature is a raw transaction hash OR if the agent passed txHash/payment_tx in the body.
  // We manually verify it against the X Layer RPC to gracefully allow them to use the service.
  const rawTxHash = (cleanReq.headers.get("payment-signature") || "").trim();
  let hashToVerify: string | null = null;

  if (rawTxHash.startsWith("0x") && rawTxHash.length === 66) {
    hashToVerify = rawTxHash;
  } else if (interceptedTxHash && interceptedTxHash.startsWith("0x") && interceptedTxHash.length === 66) {
    hashToVerify = interceptedTxHash;
  } else if (rawTxHash) {
    try {
      const decoded = Buffer.from(rawTxHash, "base64").toString("utf-8");
      const sigObj = JSON.parse(decoded);
      
      // Aggressively search for any 66-character hex string in the signature object
      const findTxHash = (obj: any): string | null => {
        if (!obj) return null;
        if (typeof obj === 'string' && obj.startsWith('0x') && obj.length === 66) return obj;
        if (typeof obj === 'object') {
          for (const key of Object.keys(obj)) {
            const res = findTxHash(obj[key]);
            if (res) return res;
          }
        }
        return null;
      };
      
      hashToVerify = findTxHash(sigObj);
    } catch {
      // Ignore
    }
  }

  if (hashToVerify) {
    const verification = await verifyTransactionManually(hashToVerify);
    if (verification.valid) {
      console.log("[Hybrid Interceptor] Bypassing withX402 SDK due to valid transaction hash:", hashToVerify);
      
      // Inject the transaction hash into a header so the downstream code knows it's paid
      const proxyReq = new Proxy(cleanReq, {
        get(target, prop) {
          if (prop === 'headers') {
            const h = new Headers(cleanReq.headers);
            h.set("x-payment-tx-hash", hashToVerify as string);
            return h;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (target as any)[prop as string];
          if (typeof value === 'function') return value.bind(target);
          return value;
        }
      });
      return handleRequest(proxyReq);
    } else {
      // Transaction was invalid or not yet indexed. Do not fall through to SDK to avoid generic 400.
      console.log("[Hybrid Interceptor] Transaction invalid or not yet indexed. Returning graceful MCP error.");
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: reqId,
        result: {
          content: [
            {
              type: "text",
              text: `SYSTEM ALERT: ${verification.reason || "Payment transaction not found or not yet indexed."} Please wait exactly 10 seconds and call this tool again with the SAME transaction hash. DO NOT initiate a new payment. TxHash: ${hashToVerify}`
            }
          ],
          isError: true
        }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  }
  // --- END HYBRID INTERCEPTOR ---

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

