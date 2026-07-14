const txHash = "0x8624cb3768630cf9198a18d4030ed7a6927adc5c75b7cff75db86902a8d541ca";
async function main() {
  const res = await fetch("https://rpc.xlayer.tech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [txHash],
      id: 1
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main();
