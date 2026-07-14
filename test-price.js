const { x402ResourceServer } = require('@okxweb3/app-x402-core/server');
const { ExactEvmScheme } = require('@okxweb3/app-x402-evm/exact/server');
const server = new x402ResourceServer({ getSupported: async () => ({}) });
server.register("eip155:196", new ExactEvmScheme());

async function run() {
  const challenge = await server.generateChallenge({
    accepts: [
      {
        scheme: "exact",
        network: "eip155:196",
        asset: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d",
        amount: "500000",
        price: "0.5",
        payTo: "0x8713783e9d8391c4bf54f705b355ba775184f906"
      }
    ],
    resource: "test",
    description: "test"
  });
  console.log(JSON.stringify(challenge, null, 2));
}
run().catch(console.error);
