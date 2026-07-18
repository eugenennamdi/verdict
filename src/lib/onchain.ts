import { ethers } from "ethers";

// The ABI for the deployed VerdictAttestation contract
const abi = [
  "function mintAttestation(address to, string memory reportId, string memory uri) public returns (uint256)",
  "event AttestationMinted(address indexed to, uint256 indexed tokenId, string reportId)"
];

// Read from env. In production, NEXT_PUBLIC_CONTRACT_ADDRESS should be used, but since we are deploying it dynamically,
// we'll update this once deployed.
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS || "";
const RPC_URL = "https://rpc.xlayer.tech";

export async function submitAttestation(reportId: string, url: string, score: number, status: string): Promise<string> {
  const privateKey = process.env.RELAYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("RELAYER_PRIVATE_KEY is not configured.");
  }
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS is not configured.");
  }

  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Initialize contract instance
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

  // Generate Base64 Metadata on-chain so OKX Explorer reads it instantly without needing the API to be deployed
  const metadata = {
    name: "Verdict Growth Readiness Attestation",
    description: `Onchain attestation of growth readiness by Verdict for report ${reportId}.`,
    image: "https://iili.io/CjhawSj.png",
    external_url: `https://tryverdict.xyz/report/${reportId}`
  };
  
  // Convert JSON to base64
  const base64Json = Buffer.from(JSON.stringify(metadata)).toString('base64');
  const tokenUri = `data:application/json;base64,${base64Json}`;
  console.log(`Minting NFT Attestation for ${reportId} to X Layer...`);
  const tx = await contract.mintAttestation(wallet.address, reportId, tokenUri);
  
  console.log(`Transaction submitted! Hash: ${tx.hash}`);
  
  // We can wait for it to be mined, but since this might block the API response,
  // returning the hash immediately is often better for user experience. 
  // However, wait for 1 confirmation to ensure it's logged successfully.
  await tx.wait(1);
  
  console.log(`Transaction confirmed on X Layer: ${tx.hash}`);
  return tx.hash;
}
