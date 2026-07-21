const { x402HTTPResourceServer, x402ResourceServer } = require("@okxweb3/app-x402-core/server");
const { ExactEvmScheme } = require("@okxweb3/app-x402-evm/exact/server");

const server = new x402ResourceServer({
  syncVerification: async () => ({ success: true })
});
server.register("eip155:196", new ExactEvmScheme());

const httpServer = new x402HTTPResourceServer(server, {
  "/api/evaluate-mcp": {
    accepts: [
      {
        scheme: "exact",
        network: "eip155:196",
        price: "0.5",
        payTo: "0x8713783e9d8391c4bf54f705b355ba775184f906"
      }
    ]
  }
});

async function test() {
  await server.initialize();
  const result = await httpServer.processHTTPRequest({
    adapter: {
      getPath: () => "/api/evaluate-mcp",
      getMethod: () => "POST",
      getAcceptHeader: () => "application/json",
      getUserAgent: () => "curl",
      getHeader: () => undefined,
      getHeaders: () => ({}),
      getQueryParams: () => ({}),
      getBody: () => Promise.resolve({}),
      getUrl: () => "https://tryverdict.xyz/api/evaluate-mcp"
    },
    path: "/api/evaluate-mcp",
    method: "POST",
    paymentHeader: undefined
  });

  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
