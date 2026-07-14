import { OKXFacilitatorClient } from "@okxweb3/app-x402-core";
import { x402ResourceServer } from "@okxweb3/app-x402-core/server";
import { ExactEvmScheme } from "@okxweb3/app-x402-evm/exact/server";

let resourceServerInstance: x402ResourceServer | null = null;

export async function getPaymentServer(): Promise<x402ResourceServer> {
  if (resourceServerInstance) {
    return resourceServerInstance;
  }

  const apiKey = process.env.OKX_API_KEY || "";
  const secretKey = process.env.OKX_SECRET_KEY || "";
  const passphrase = process.env.OKX_PASSPHRASE || "";

  if (!apiKey || !secretKey || !passphrase) {
    console.warn("x402: OKX API credentials missing in environment variables!");
  }

  const facilitatorClient = new OKXFacilitatorClient({
    apiKey,
    secretKey,
    passphrase,
  });

  resourceServerInstance = new x402ResourceServer(facilitatorClient);
  resourceServerInstance.register("eip155:196", new ExactEvmScheme());

  resourceServerInstance.onVerifyFailure((ctx: any) => {
    console.error("x402 Verification Failed!", ctx.error);
    if (ctx.payload) {
      console.error("Payload:", ctx.payload);
    }
  });

  resourceServerInstance.onAfterSettle(async (ctx: any) => {
    if (ctx.result) {
      if (ctx.result.success) {
        console.log("x402 Settlement Successful! txHash:", ctx.result.txHash);
        const req = ctx.transportContext?.req;
        if (req && req.headers && ctx.result.txHash) {
          req.headers.set('x-payment-tx-hash', ctx.result.txHash);
        }
      } else {
        console.error("x402 Settlement Failed:", ctx.result.error);
      }
    }
  });

  // MUST run after server starts, before any request is handled
  await resourceServerInstance.initialize();

  return resourceServerInstance;
}
