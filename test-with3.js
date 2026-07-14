const { x402HTTPResourceServer } = require('@okxweb3/app-x402-core/server');
const { ExactEvmScheme } = require('@okxweb3/app-x402-evm/exact/server');
const server = new x402HTTPResourceServer({
  register: () => {},
  getSupportedKind: () => ({ x402Version: "2.0", scheme: "exact", network: "eip155:196" }),
  buildPaymentRequirements: () => [ { scheme: "exact", network: "eip155:196", asset: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", amount: "500000" } ],
  createPaymentRequiredResponse: (reqs, res) => { return new Response("402") },
  verifyPayment: () => {}
}, {
  "*": {
    accepts: [
      {
        scheme: "exact",
        network: "eip155:196",
        asset: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d",
        amount: "500000",
        price: { amount: "500000", asset: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d" }
      }
    ]
  }
});
server.processRequest(new Request("http://localhost/"), "test").catch(console.error);
