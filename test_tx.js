const { ethers } = require("ethers");
async function checkTx() {
  const provider = new ethers.JsonRpcProvider("https://rpc.xlayer.tech");
  try {
    const tx = await provider.getTransaction("0x36c746f39dab23388697b4dc98bd6177420daee2778c1a738d89c716a4ef907c");
    if (tx) {
      console.log("Transaction found on Mainnet!", tx.to);
    } else {
      console.log("Transaction not found on Mainnet.");
    }
  } catch (e) {
    console.error("Mainnet error:", e.message);
  }

  const testnetProvider = new ethers.JsonRpcProvider("https://testrpc.xlayer.tech");
  try {
    const tx = await testnetProvider.getTransaction("0x36c746f39dab23388697b4dc98bd6177420daee2778c1a738d89c716a4ef907c");
    if (tx) {
      console.log("Transaction found on Testnet!", tx.to);
    } else {
      console.log("Transaction not found on Testnet.");
    }
  } catch (e) {
    console.error("Testnet error:", e.message);
  }
}
checkTx();
