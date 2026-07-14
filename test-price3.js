const { ExactEvmScheme } = require('@okxweb3/app-x402-evm/exact/server');
const scheme = new ExactEvmScheme();
async function test() {
  const req = { scheme: "exact", network: "eip155:196", asset: "0x111", amount: "100", price: "0.5" };
  const res = await scheme.parsePrice("0.5", "eip155:196");
  console.log(res);
}
test().catch(console.error);
