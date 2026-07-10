import { OKXFacilitatorClient } from "@okxweb3/app-x402-core";
import { x402ResourceServer } from "@okxweb3/app-x402-core/server";
import { ExactEvmScheme } from "@okxweb3/app-x402-evm/exact/server";

const apiKey = process.env.OKX_API_KEY || "";
const secretKey = process.env.OKX_SECRET_KEY || "";
const passphrase = process.env.OKX_PASSPHRASE || "";

let resourceServerInstance: x402ResourceServer | null = null;

export async function getPaymentServer(): Promise<x402ResourceServer> {
  if (resourceServerInstance) {
    return resourceServerInstance;
  }

  const facilitatorClient = new OKXFacilitatorClient({
    apiKey,
    secretKey,
    passphrase,
  });

  resourceServerInstance = new x402ResourceServer(facilitatorClient);
  resourceServerInstance.register("eip155:196", new ExactEvmScheme());

  // MUST run after server starts, before any request is handled
  await resourceServerInstance.initialize();

  return resourceServerInstance;
}
