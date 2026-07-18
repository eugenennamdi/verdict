const solc = require('solc');
const fs = require('fs');
const ethers = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("Compiling contract...");
  const sourceCode = fs.readFileSync('contracts/VerdictAttestation.sol', 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'VerdictAttestation.sol': {
        content: sourceCode
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

  function findImports(path) {
    try {
      if (path.startsWith('@openzeppelin/')) {
        return { contents: fs.readFileSync(`node_modules/${path}`, 'utf8') };
      }
      return { error: 'File not found' };
    } catch (e) {
      return { error: e.message };
    }
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  
  if (output.errors) {
    let hasError = false;
    output.errors.forEach(err => {
      console.error(err.formattedMessage);
      if (err.severity === 'error') hasError = true;
    });
    if (hasError) process.exit(1);
  }

  const contractFile = output.contracts['VerdictAttestation.sol']['VerdictAttestation'];
  const abi = contractFile.abi;
  const bytecode = contractFile.evm.bytecode.object;

  console.log("Contract compiled successfully.");

  // Deploy
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  if (!privateKey) throw new Error("Missing RELAYER_PRIVATE_KEY");

  const provider = new ethers.JsonRpcProvider("https://rpc.xlayer.tech");
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying to X Layer with wallet:", wallet.address);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  
  console.log("Waiting for deployment...");
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`\n✅ VerdictAttestation deployed successfully!`);
  console.log(`Address: ${address}`);
  console.log(`\nPlease add this to your .env.local:`);
  console.log(`NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS="${address}"`);
}

main().catch(console.error);
