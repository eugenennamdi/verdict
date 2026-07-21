async function checkTx() {
  try {
    const res = await fetch("https://testrpc.xlayer.tech", {
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
checkTx();
