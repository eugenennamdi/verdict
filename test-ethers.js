const { ethers } = require("ethers");
try {
  console.log("Checksum:", ethers.getAddress("0x8713783e9d8391c4bf54f705b355ba775184f906"));
} catch (e) {
  console.log("Error:", e.message);
}
