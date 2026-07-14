const txHash = "0xc80574398f1567a7af1d7391eb60081935b2c0888d3d9cbf12c8c6cc46c6031d";

async function main() {
  console.log("Simulating Hermes A2MCP Call with Raw Transaction Hash...");
  try {
    const res = await fetch("http://localhost:3000/api/evaluate-mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "payment-signature": txHash,
      },
      body: JSON.stringify({
        method: "evaluate",
        params: {
          url: "https://example.com"
        }
      })
    });
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Response:", data.substring(0, 500));
  } catch (err) {
    console.error(err);
  }
}

main();
