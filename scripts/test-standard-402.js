async function main() {
  console.log("Simulating Standard OKX.AI A2MCP Call WITHOUT Payment...");
  try {
    const res = await fetch("http://localhost:3000/api/evaluate-mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
