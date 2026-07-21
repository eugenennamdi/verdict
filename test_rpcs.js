async function checkTx() {
  const rpcs = [
    "https://endpoints.omniatech.io/v1/xlayer/mainnet/public",
    "https://xlayer.drpc.org",
    "https://xlayer.blockpi.network/v1/rpc/public"
  ];
  for (const rpc of rpcs) {
    try {
      console.log(`Testing ${rpc}...`);
      const res = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionReceipt",
          params: ["0x36c746f39dab23388697b4dc98bd6177420daee2778c1a738d89c716a4ef907c"],
          id: 1
        })
      });
      console.log("Status:", res.status);
      const data = await res.text();
      console.log("Body:", data);
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
}
checkTx();
