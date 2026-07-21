const { ethers } = require("ethers");
async function checkTx() {
  const provider = new ethers.JsonRpcProvider("https://xlayer-rpc.publicnode.com");
  try {
    const tx = await provider.getTransaction("0x36c746f39dab23388697b4dc98bd6177420daee2778c1a738d89c716a4ef907c");
    if (tx) {
      console.log("Transaction found on PublicNode!", tx.to);
      console.log(tx);
    } else {
      console.log("Transaction not found on PublicNode.");
    }
  } catch (e) {
    console.error("PublicNode error:", e.message);
  }
}
checkTx();
