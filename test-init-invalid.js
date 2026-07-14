const { OKXFacilitatorClient } = require('@okxweb3/app-x402-core');
const client = new OKXFacilitatorClient({
  apiKey: "invalid",
  secretKey: "invalid",
  passphrase: "invalid",
});
client.getSupported().then(console.log).catch(console.error);
