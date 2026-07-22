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

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
};

const processSingleUrl = async (url: string, txHash?: string | null) => {
  try {
    console.log(`Evaluating URL: ${url}`);
    const audit = await performFullAudit(url);
    if (!audit) {
      throw new Error(`Failed to generate audit for ${url}`);
    }

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

    const parsedContent: Record<string, unknown> = {
      url,
      company_name: audit.company_name,
      target_audience: audit.target_audience,
      growth_readiness_score: audit.overallScore,
      score_interpretation: audit.score_interpretation,
      verdict: audit.the_verdict,
      actionable_feedback: audit.priority_matrix,
      ...(reportUrl ? { report_url: reportUrl } : {})
    };

    if (txHash && txHash.startsWith("0x")) {
      parsedContent.transaction_link = `https://web3.okx.com/explorer/x-layer/evm/tx/${txHash}`;
    }

    return parsedContent;
  } catch (err: any) {
    return { url, error: err.message || "Evaluation failed" };
  }
};

// Define the MCP Server
const createMCPServer = () => {
  const server = new Server({
    name: "Verdict Bulk Evaluation Server",
    version: "1.0.0"
  }, {
    capabilities: { tools: {} }
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [{
        name: "bulk_evaluate_startups",
        description: "Evaluates an array of startup landing pages across 7 growth pillars. Deducts a payment of 10 USDT. You MUST explicitly ask the user for the startup URLs before calling this tool. Max 20 URLs.",
        inputSchema: {
          type: "object",
          properties: {
            urls: { 
              type: "array", 
              items: { type: "string" },
              maxItems: 20,
              description: "Array of exact URLs of the startups to evaluate. Do NOT guess these." 
            },
            txHash: { 
              type: "string", 
              description: "Optional. If this tool previously returned a 402 Payment Required error, you MUST call this tool again and pass the resulting payment transaction hash here." 
            }
          },
          required: ["urls"]
        }
      }]
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "bulk_evaluate_startups") {
      const { urls } = request.params.arguments as { urls?: string[] };
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw new Error("An array of URLs is required");
      }
      if (urls.length > 20) {
        throw new Error("Maximum of 20 URLs allowed per bulk request");
      }

      try {
        console.log(`Evaluating ${urls.length} URLs in bulk...`);
        const results = [];
        const chunks = chunkArray(urls, 5);
        for (const chunk of chunks) {
          const promises = chunk.map(url => processSingleUrl(url));
          const chunkResults = await Promise.all(promises);
          results.push(...chunkResults);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2)
            }
          ]
        };
      } catch (e: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error evaluating startups: ${e instanceof Error ? e.message : String(e)}`
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
                name: "verdict-bulk-mcp",
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
                name: "bulk_evaluate_startups",
                description: "Evaluates an array of startup landing pages across 7 growth pillars. Deducts a payment of 10 USDT. You MUST explicitly ask the user for the startup URLs before calling this tool. Max 20 URLs.",
                inputSchema: {
                  type: "object",
                  properties: {
                    urls: { 
                      type: "array", 
                      items: { type: "string" },
                      maxItems: 20,
                      description: "Array of exact URLs of the startups to evaluate. Do NOT guess these." 
                    }
                  },
                  required: ["urls"]
                }
              }]
            }
          }), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        // For stateless A2MCP agents (like Hermes), just extract the URLs and run the audit directly
        const hasUrls = body.urls || body.params?.urls || body.arguments?.urls || body.params?.arguments?.urls || body.target_urls;
        
        if (hasUrls && Array.isArray(hasUrls)) {
          if (hasUrls.length > 20) {
             return new Response(JSON.stringify({
              jsonrpc: "2.0",
              id: body.id || 1,
              error: {
                code: -32602,
                message: "Maximum of 20 URLs allowed per bulk request."
              }
             }), { status: 400, headers: { "Content-Type": "application/json" } });
          }

          console.log(`Bypassing MCP SDK initialization to evaluate ${hasUrls.length} URLs directly`);
          
          let txHash = req.headers.get("x-payment-tx-hash");
          if (!txHash) {
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

          const results = [];
          const chunks = chunkArray(hasUrls, 5);
          for (const chunk of chunks) {
            const promises = chunk.map(url => processSingleUrl(url, txHash));
            const chunkResults = await Promise.all(promises);
            results.push(...chunkResults);
          }

          const mcpResponse = {
            jsonrpc: "2.0",
            id: body.id || 1,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(results, null, 2)
                }
              ]
            }
          };

          return new Response(JSON.stringify(mcpResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        // If Hermes tries to call an evaluation method but forgot the URLs parameter
        if (body.method === "tools/call" || body.method === "bulk_evaluate_startups" || body.action === "bulk_evaluate") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id || 1,
            error: {
              code: -32602,
              message: "Invalid params: 'urls' array is required. Please ask the user for the URLs and resubmit."
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
      price: "10.0", // 10 USDT for Bulk Audits
      payTo: process.env.PAYMENT_ADDRESS || "0x8713783e9d8391c4bf54f705b355ba775184f906",
    }
  ],
  description: "Verdict Bulk Evaluation Server",
  resource: "https://tryverdict.xyz/api/bulk-evaluate-mcp",
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
    
    newHeaders.set(headerName, token);
  };

  processHeader(rawSig, "payment-signature");
  processHeader(rawAuth, "authorization");
  
  const finalAuthToken = newHeaders.get("authorization");
  if (finalAuthToken && !newHeaders.get("payment-signature")) {
    newHeaders.set("payment-signature", finalAuthToken);
  }

  return new Proxy(req, {
    get(target, prop) {
      if (prop === 'headers') return newHeaders;
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

const verifyTransactionManually = async (txHash: string): Promise<{ valid: boolean; reason?: string }> => {
  try {
    console.log(`[Hybrid Interceptor] Verifying raw tx hash against X Layer RPC: ${txHash}`);
    
    // 1. Check Receipt (did it succeed?) with retries for RPC sync delays
    let receiptData = null;
    let retries = 3; // Reduced from 15 so we don't block for 30s and hit client timeout. 
    while (retries > 0) {
      const receiptRes = await fetch("https://rpc.xlayer.tech", {
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
    const REQUIRED_AMOUNT = BigInt(10000000); // 10.0 USDT (6 decimals)

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

export const POST = async (req: Request) => {
  const cleanReq = await createCleanReq(req);
  
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
  // OpenClaw and other clients have a 60s timeout.
  // The hybrid interceptor will gracefully return a SYSTEM ALERT if it's not indexed yet.
  if (requiresPayment && cleanReq.headers.get("payment-signature")) {
    console.log("Payment signature detected. Skipping manual wait to avoid client timeout...");
  }

  if (!requiresPayment) {
    return handleRequest(cleanReq);
  }

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
      if (sigObj.receipt && typeof sigObj.receipt === 'string' && sigObj.receipt.startsWith("0x") && sigObj.receipt.length === 66) {
        hashToVerify = sigObj.receipt;
      }
    } catch {
      // Ignore
    }
  }

  if (hashToVerify) {
    const verification = await verifyTransactionManually(hashToVerify);
    if (verification.valid) {
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
          isError: false
        }
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  }

  const paymentServer = await getPaymentServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalRes = await withBodyIf402(cleanReq, protectedHandler as any);

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
  
  const acceptHeader = cleanReq.headers.get("accept") || "";
  if (!acceptHeader.includes("text/event-stream")) {
    return new Response(JSON.stringify({ 
      status: "online", 
      message: "Verdict Bulk A2MCP Endpoint is active.",
      x402: routeConfig 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  return handleRequest(cleanReq);
};
