const { ethers } = require("ethers");
async function checkTx() {
  const provider = new ethers.JsonRpcProvider("https://xlayerrpc.okx.com");
  try {
    const tx = await provider.getTransaction("0x36c746f39dab23388697b4dc98bd6177420daee2778c1a738d89c716a4ef907c");
    if (tx) {
      console.log("Transaction found on xlayerrpc.okx.com!", tx.to);
    } else {
      console.log("Transaction not found on xlayerrpc.okx.com.");
    }
  } catch (e) {
    console.error("xlayerrpc.okx.com error:", e.message);
  }
}
checkTx();
