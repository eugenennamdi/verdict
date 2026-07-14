const { OKXFacilitatorClient } = require('@okxweb3/app-x402-core');
const { x402ResourceServer } = require('@okxweb3/app-x402-core/server');
const { ExactEvmScheme } = require('@okxweb3/app-x402-evm/exact/server');

async function run() {
  const facilitatorClient = new OKXFacilitatorClient({
    apiKey: "",
    secretKey: "",
    passphrase: "",
  });

  const resourceServerInstance = new x402ResourceServer(facilitatorClient);
  resourceServerInstance.register("eip155:196", new ExactEvmScheme());

  try {
    await resourceServerInstance.initialize();
    console.log("Initialized successfully!");
  } catch(e) {
    console.log("Error initializing:", e.message);
  }
}
run().catch(console.error);
