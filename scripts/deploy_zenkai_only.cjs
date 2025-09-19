const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying ZenkaiINFT to 0G Galileo testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    throw new Error("Deployer wallet has no balance. Please fund the wallet first.");
  }
  
  // Deploy ZenkaiINFT with constructor parameters
  const royaltyReceiver = deployer.address;
  const royaltyBps = 500; // 5% default royalty
  
  console.log("📄 Deploying ZenkaiINFT contract...");
  const ZenkaiINFT = await ethers.getContractFactory("ZenkaiINFT");
  const zenkaiINFT = await ZenkaiINFT.deploy(
    "Zenkai Intelligence NFT", // name
    "ZINFT",                   // symbol
    deployer.address,          // admin
    royaltyReceiver,           // royalty receiver
    royaltyBps                 // royalty basis points (5%)
  );
  
  console.log("⏳ Waiting for deployment transaction...");
  await zenkaiINFT.waitForDeployment();
  
  const contractAddress = await zenkaiINFT.getAddress();
  console.log("✅ ZenkaiINFT deployed to:", contractAddress);
  
  // Get transaction hash
  const deploymentTransaction = zenkaiINFT.deploymentTransaction();
  const txHash = deploymentTransaction?.hash;
  console.log("📝 Transaction hash:", txHash);
  
  // Wait for confirmation
  if (deploymentTransaction) {
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await deploymentTransaction.wait(1);
    console.log("✅ Contract deployed in block:", receipt.blockNumber);
  }
  
  // Export contract info to frontend
  const contractDir = path.resolve(__dirname, "../client/src/lib/contracts");
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, { recursive: true });
  }
  
  // Read current addresses and ABIs
  const addressesPath = path.join(contractDir, "addresses.json");
  const abisPath = path.join(contractDir, "abis.json");
  
  let addresses = {};
  let abis = {};
  
  try {
    addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  } catch (e) {
    console.log("Creating new addresses.json");
  }
  
  try {
    abis = JSON.parse(fs.readFileSync(abisPath, "utf8"));
  } catch (e) {
    console.log("Creating new abis.json");
  }
  
  // Get ABI from artifacts
  const artifact = await ethers.getContractFactory("ZenkaiINFT");
  const abi = artifact.interface.fragments.map(fragment => fragment.format("json")).map(JSON.parse);
  
  // Update addresses and ABIs
  addresses.ZenkaiINFT = contractAddress;
  addresses.deployedAt = new Date().toISOString();
  
  // Update explorer URL
  addresses.explorerUrls = addresses.explorerUrls || {};
  addresses.explorerUrls.ZenkaiINFT = `https://chainscan-galileo.0g.ai/address/${contractAddress}`;
  
  abis.ZenkaiINFT = abi;
  
  // Write updated files
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  fs.writeFileSync(abisPath, JSON.stringify(abis, null, 2));
  
  console.log("📁 Updated frontend configuration files:");
  console.log("   - addresses.json");
  console.log("   - abis.json");
  console.log("");
  console.log("🎉 Deployment completed successfully!");
  console.log("📄 Contract Address:", contractAddress);
  console.log("🔗 Explorer URL:", `https://chainscan-galileo.0g.ai/address/${contractAddress}`);
  console.log("📝 Transaction:", `https://chainscan-galileo.0g.ai/tx/${txHash}`);
  
  return {
    contractAddress,
    transactionHash: txHash,
    explorerUrl: `https://chainscan-galileo.0g.ai/address/${contractAddress}`
  };
}

main()
  .then((result) => {
    console.log("\n✅ ZenkaiINFT deployment successful!");
    console.log("Result:", JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });