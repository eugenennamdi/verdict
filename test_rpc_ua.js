const { ethers } = require("ethers");
async function checkTx() {
  const fetchReq = new ethers.FetchRequest("https://rpc.xlayer.tech");
  fetchReq.setHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  
  const provider = new ethers.JsonRpcProvider(fetchReq);
  try {
    const tx = await provider.getTransaction("0x36c746f39dab23388697b4dc98bd6177420daee2778c1a738d89c716a4ef907c");
    if (tx) {
      console.log("Transaction found on rpc.xlayer.tech!", tx.to);
    } else {
      console.log("Transaction not found on rpc.xlayer.tech.");
    }
  } catch (e) {
    console.error("rpc.xlayer.tech error:", e.message);
  }
}
checkTx();
