const { x402ResourceServer } = require('@okxweb3/app-x402-core/server');
const server = new x402ResourceServer({ getSupported: async () => ({}) });
console.log(Object.getOwnPropertyNames(x402ResourceServer.prototype));
